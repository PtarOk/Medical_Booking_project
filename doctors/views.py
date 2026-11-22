# doctors/views.py

from rest_framework import viewsets, status, filters, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend

from .models import Doctor, Schedule, TimeSlot
from .serializers import (
    DoctorUpdateSerializer,      # Убедись, что этот класс есть в serializers.py!
    DoctorListSerializer,
    DoctorDetailSerializer,
    ScheduleSerializer,
    TimeSlotSerializer,
    TimeSlotListSerializer,
)
from users.permissions import IsDoctor


# ============================================================
# СПИСОК ВРАЧЕЙ (публичный доступ)
# ============================================================

class DoctorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Doctor.objects.filter(is_available=True).select_related('user')
    permission_classes = [permissions.AllowAny]

    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['specialty', 'is_available']
    ordering_fields = ['price', 'created_at', 'average_rating', 'experience_years']

    def get_serializer_class(self):
        if self.action == 'list':
            return DoctorListSerializer
        return DoctorDetailSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        search = request.query_params.get('search', '').strip().lower()

        if search:
            filtered = []
            for doctor in queryset:
                first_name = (doctor.user.first_name or '').lower()
                last_name = (doctor.user.last_name or '').lower()
                specialty = (doctor.specialty or '').lower()

                if (search in first_name or search in last_name or search in specialty):
                    filtered.append(doctor)
        else:
            filtered = list(queryset)

        try:
            page = int(request.query_params.get('page', 1))
            page_size = int(request.query_params.get('page_size', 10))
        except ValueError:
            page = 1
            page_size = 10

        if page < 1: page = 1
        if page_size < 1 or page_size > 100: page_size = 10

        start = (page - 1) * page_size
        end = start + page_size
        paginated_results = filtered[start:end]

        serializer = self.get_serializer(paginated_results, many=True)
        total = len(filtered)

        return Response({
            'count': total,
            'next': f'{request.path}?page={page + 1}&page_size={page_size}' if end < total else None,
            'previous': f'{request.path}?page={page - 1}&page_size={page_size}' if page > 1 else None,
            'results': serializer.data,
        })

    @action(detail=True, methods=['get'], url_path='slots')
    def slots(self, request, pk=None):
        doctor = self.get_object()
        date_str = request.query_params.get('date')

        if not date_str:
            return Response({'error': 'Параметр date обязателен (формат: YYYY-MM-DD).'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            from datetime import datetime
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Неверный формат даты. Используйте YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)

        if target_date < timezone.now().date():
            return Response({'error': 'Нельзя посмотреть слоты на прошедшую дату.'}, status=status.HTTP_400_BAD_REQUEST)

        slots = TimeSlot.objects.filter(doctor=doctor, date=target_date).order_by('start_time')
        serializer = TimeSlotListSerializer(slots, many=True)

        return Response({
            'doctor_id': doctor.id,
            'doctor_name': doctor.full_name,
            'date': date_str,
            'slots': serializer.data,
            'total': slots.count(),
            'available': slots.filter(is_available=True).count(),
        })

    @action(detail=True, methods=['get'], url_path='schedule')
    def schedule(self, request, pk=None):
        doctor = self.get_object()
        schedules = Schedule.objects.filter(doctor=doctor).order_by('day_of_week')
        serializer = ScheduleSerializer(schedules, many=True)

        return Response({
            'doctor_id': doctor.id,
            'doctor_name': doctor.full_name,
            'schedule': serializer.data,
        })


# ============================================================
# ПРОФИЛЬ ТЕКУЩЕГО ВРАЧА (для кнопки "Мой профиль")
# ============================================================

class MyDoctorProfileView(APIView):
    """
    GET   /api/doctors/me/  — получить мой профиль врача
    PATCH /api/doctors/me/  — обновить мой профиль врача
    """
    permission_classes = [permissions.IsAuthenticated, IsDoctor]

    def get(self, request):
        try:
            doctor = request.user.doctor_profile
            serializer = DoctorDetailSerializer(doctor)
            return Response(serializer.data)
        except Doctor.DoesNotExist:
            return Response(
                {'error': 'Профиль врача не найден. Создайте его в админке.'},
                status=status.HTTP_404_NOT_FOUND
            )

    def patch(self, request):
        try:
            doctor = request.user.doctor_profile
        except Doctor.DoesNotExist:
            return Response(
                {'error': 'Профиль врача не найден.'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = DoctorUpdateSerializer(
            doctor,
            data=request.data,
            partial=True  # разрешаем обновлять только часть полей
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Возвращаем полный обновлённый профиль
        return Response(DoctorDetailSerializer(doctor).data)


# ============================================================
# УПРАВЛЕНИЕ РАСПИСАНИЕМ (только для врачей)
# ============================================================

class DoctorScheduleViewSet(viewsets.ModelViewSet):
    serializer_class = ScheduleSerializer
    permission_classes = [permissions.IsAuthenticated, IsDoctor]

    def get_queryset(self):
        return Schedule.objects.filter(doctor=self.request.user.doctor_profile)

    def perform_create(self, serializer):
        serializer.save(doctor=self.request.user.doctor_profile)

    @action(detail=False, methods=['put'], url_path='update-weekly')
    def update_weekly(self, request):
        doctor = request.user.doctor_profile
        schedules_data = request.data.get('schedules', [])

        if not isinstance(schedules_data, list):
            return Response({'error': 'Поле "schedules" должно быть списком'}, status=status.HTTP_400_BAD_REQUEST)

        def clean_time(val):
            if val is None or val == '' or val == '--:--':
                return None
            return val

        updated = 0
        for item in schedules_data:
            try:
                day = int(item.get('day_of_week'))
            except (ValueError, TypeError):
                continue

            is_working = bool(item.get('is_working_day', True))

            Schedule.objects.update_or_create(
                doctor=doctor,
                day_of_week=day,
                defaults={
                    'start_time': clean_time(item.get('start_time')) or '09:00',
                    'end_time': clean_time(item.get('end_time')) or '18:00',
                    'break_start': clean_time(item.get('break_start')),
                    'break_end': clean_time(item.get('break_end')),
                    'is_working_day': is_working,
                }
            )
            updated += 1

        return Response({
            'message': f'Обновлено {updated} дней расписания',
            'updated': updated,
        }, status=status.HTTP_200_OK)


# ============================================================
# УПРАВЛЕНИЕ СЛОТАМИ (только для врачей)
# ============================================================

class DoctorTimeSlotViewSet(viewsets.ModelViewSet):
    serializer_class = TimeSlotSerializer
    permission_classes = [permissions.IsAuthenticated, IsDoctor]

    def get_queryset(self):
        return TimeSlot.objects.filter(doctor=self.request.user.doctor_profile)

    def perform_create(self, serializer):
        serializer.save(doctor=self.request.user.doctor_profile)


# ============================================================
# ГЕНЕРАЦИЯ СЛОТОВ (только для врачей)
# ============================================================

class GenerateSlotsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsDoctor]

    def post(self, request):
        from .services import generate_slots_for_doctor

        doctor = request.user.doctor_profile
        days_ahead = request.data.get('days_ahead', 30)

        if not isinstance(days_ahead, int) or days_ahead < 1 or days_ahead > 90:
            return Response({'error': 'days_ahead должен быть числом от 1 до 90'}, status=status.HTTP_400_BAD_REQUEST)

        if not Schedule.objects.filter(doctor=doctor, is_working_day=True).exists():
            return Response({'error': 'Сначала настройте расписание'}, status=status.HTTP_400_BAD_REQUEST)

        slots_created, message = generate_slots_for_doctor(doctor, days_ahead)

        return Response({
            'message': message,
            'slots_created': slots_created,
            'days_ahead': days_ahead,
        }, status=status.HTTP_201_CREATED)