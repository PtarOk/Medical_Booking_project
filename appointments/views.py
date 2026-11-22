# appointments/views.py

from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from django.db import transaction
from datetime import datetime, timedelta  # ← ИСПРАВЛЕНО: добавлен timedelta

from .models import Appointment
from .serializers import (
    AppointmentCreateSerializer,
    AppointmentSerializer,
    AppointmentCancelSerializer,
)
from users.permissions import IsPatient, IsDoctor, IsOwnerOrReadOnly


# ============================================================
# ЗАПИСИ (для пациентов и врачей)
# ============================================================

class AppointmentViewSet(viewsets.ModelViewSet):
    """
    CRUD записей на приём.

    Пациент может:
      - Создавать записи (POST)
      - Видеть свои записи (GET)
      - Отменять свои записи (PATCH /cancel/)

    Врач может:
      - Видеть записи к себе (GET)
      - Подтверждать/отменять/завершать (PATCH)

    Админ может:
      - Видеть все записи
    """

    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        """Разные сериализаторы для создания и чтения."""
        if self.action == 'create':
            return AppointmentCreateSerializer
        return AppointmentSerializer

    def get_queryset(self):
        """
        Возвращаем записи в зависимости от роли:
        - Пациент: свои записи
        - Врач: записи к себе
        - Админ: все записи
        """
        user = self.request.user

        if user.role == 'patient':
            return Appointment.objects.filter(patient=user).select_related(
                'doctor__user', 'slot'
            )
        elif user.role == 'doctor':
            return Appointment.objects.filter(
                doctor=user.doctor_profile
            ).select_related('patient', 'slot')
        elif user.role == 'admin':
            return Appointment.objects.all().select_related(
                'patient', 'doctor__user', 'slot'
            )

        return Appointment.objects.none()

    # --------------------------------------------------------
    # POST /api/appointments/  — создать запись
    # --------------------------------------------------------
    def create(self, request, *args, **kwargs):
        """
        Создание записи с защитой от двойной записи через транзакцию.
        """
        # Проверяем, что пользователь — пациент
        if request.user.role != 'patient':
            return Response(
                {'error': 'Только пациенты могут создавать записи.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # 👇 ТРАНЗАКЦИЯ НАЧИНАЕТСЯ ЗДЕСЬ (охватывает и валидацию, и сохранение)
        try:
            with transaction.atomic():
                serializer = self.get_serializer(data=request.data)
                serializer.is_valid(raise_exception=True)
                appointment = serializer.save(patient=request.user)

        except Exception as e:
            return Response(
                {'error': f'Не удалось создать запись: {str(e)}'},
                status=status.HTTP_409_CONFLICT
            )

        # Возвращаем созданную запись с полными данными
        response_serializer = AppointmentSerializer(appointment)
        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED
        )

    # --------------------------------------------------------
    # GET /api/appointments/upcoming/  — предстоящие записи
    # --------------------------------------------------------
    @action(detail=False, methods=['get'], url_path='upcoming')
    def upcoming(self, request):
        """
        Возвращает только предстоящие (не отменённые и не завершённые) записи.
        """
        queryset = self.get_queryset().filter(
            status__in=[Appointment.Status.PENDING, Appointment.Status.CONFIRMED],
            slot__date__gte=timezone.now().date()
        ).order_by('slot__date', 'slot__start_time')

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    # --------------------------------------------------------
    # GET /api/appointments/history/  — история записей
    # --------------------------------------------------------
    @action(detail=False, methods=['get'], url_path='history')
    def history(self, request):
        """
        Возвращает завершённые и отменённые записи.
        """
        queryset = self.get_queryset().filter(
            status__in=[Appointment.Status.COMPLETED, Appointment.Status.CANCELLED]
        ).order_by('-slot__date', '-slot__start_time')

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    # --------------------------------------------------------
    # PATCH /api/appointments/{id}/cancel/  — отменить запись
    # --------------------------------------------------------
    @action(detail=True, methods=['patch'], url_path='cancel')
    def cancel(self, request, pk=None):
        """
        Отмена записи пациентом.
        Ограничение: не позднее чем за 2 часа до приёма.
        """
        appointment = self.get_object()

        # Проверка прав
        if appointment.patient != request.user:
            return Response(
                {'error': 'Вы можете отменить только свою запись.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Проверка статуса
        if appointment.status in [Appointment.Status.CANCELLED, Appointment.Status.COMPLETED]:
            return Response(
                {'error': 'Эту запись нельзя отменить.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Проверка времени (не позднее 2 часов до приёма)
        # ИСПРАВЛЕНО: используем datetime.combine и timedelta из datetime
        appointment_time = timezone.make_aware(
            datetime.combine(appointment.slot.date, appointment.slot.start_time)
        )
        two_hours_before = appointment_time - timedelta(hours=2)

        if timezone.now() > two_hours_before:
            return Response(
                {
                    'error': 'Отмена возможна не позднее чем за 2 часа до приёма.',
                    'appointment_time': appointment_time.isoformat(),
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Отменяем запись
        appointment.cancel()

        serializer = AppointmentSerializer(appointment)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # --------------------------------------------------------
    # PATCH /api/appointments/{id}/confirm/  — подтвердить
    # --------------------------------------------------------
    @action(detail=True, methods=['patch'], url_path='confirm')
    def confirm(self, request, pk=None):
        """
        Подтверждение записи врачом.
        """
        appointment = self.get_object()

        # Проверка: только врач может подтвердить
        if request.user.role != 'doctor':
            return Response(
                {'error': 'Только врач может подтвердить запись.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Проверка: это запись к текущему врачу
        if appointment.doctor.user != request.user:
            return Response(
                {'error': 'Это не ваша запись.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if appointment.status != Appointment.Status.PENDING:
            return Response(
                {'error': 'Можно подтвердить только запись в статусе "pending".'},
                status=status.HTTP_400_BAD_REQUEST
            )

        appointment.status = Appointment.Status.CONFIRMED
        appointment.save()

        serializer = AppointmentSerializer(appointment)
        return Response(serializer.data)

    # --------------------------------------------------------
    # PATCH /api/appointments/{id}/complete/  — завершить
    # --------------------------------------------------------
    @action(detail=True, methods=['patch'], url_path='complete')
    def complete(self, request, pk=None):
        """
        Отметить запись как завершённую (после приёма).
        """
        appointment = self.get_object()

        if request.user.role != 'doctor':
            return Response(
                {'error': 'Только врач может завершить запись.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if appointment.doctor.user != request.user:
            return Response(
                {'error': 'Это не ваша запись.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if appointment.status != Appointment.Status.CONFIRMED:
            return Response(
                {'error': 'Можно завершить только подтверждённую запись.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        appointment.status = Appointment.Status.COMPLETED
        appointment.save()

        serializer = AppointmentSerializer(appointment)
        return Response(serializer.data)