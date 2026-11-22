# reviews/views.py

from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Avg, Count

from .models import Review
from .serializers import (
    ReviewSerializer,
    ReviewCreateSerializer,
    ReviewResponseSerializer,
)
from users.permissions import IsDoctor, IsPatient


class DoctorReviewsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/doctors/{doctor_id}/reviews/     — список отзывов о враче
    GET /api/doctors/{doctor_id}/reviews/{id}/ — один отзыв
    POST /api/doctors/{doctor_id}/reviews/     — создать отзыв (только пациент)
    """
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        doctor_id = self.kwargs.get('doctor_pk')
        return Review.objects.filter(
            doctor_id=doctor_id,
            is_public=True
        ).select_related('patient', 'appointment', 'appointment__slot')

    def get_serializer_class(self):
        if self.action == 'create':
            return ReviewCreateSerializer
        return ReviewSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated(), IsPatient()]
        return super().get_permissions()

    def create(self, request, doctor_pk=None):
        """Создание отзыва пациентом."""
        serializer = ReviewCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)

        from appointments.models import Appointment
        appointment = Appointment.objects.get(id=serializer.validated_data['appointment_id'])

        review = Review.objects.create(
            patient=request.user,
            doctor_id=doctor_pk,
            appointment=appointment,
            rating=serializer.validated_data['rating'],
            comment=serializer.validated_data.get('comment', '')
        )

        # Обновляем кэшированный рейтинг врача
        self._update_doctor_rating(doctor_pk)

        return Response(
            ReviewSerializer(review).data,
            status=status.HTTP_201_CREATED
        )

    @staticmethod
    def _update_doctor_rating(doctor_id):
        """Пересчитывает средний рейтинг врача."""
        from doctors.models import Doctor
        stats = Review.objects.filter(doctor_id=doctor_id, is_public=True).aggregate(
            avg=Avg('rating'),
            count=Count('id')
        )
        Doctor.objects.filter(id=doctor_id).update(
            average_rating=stats['avg'] or 0,
            reviews_count=stats['count'] or 0
        )


class ReviewResponseView(APIView):
    """
    PATCH /api/reviews/{review_id}/response/
    Врач отвечает на отзыв о себе.
    """
    permission_classes = [permissions.IsAuthenticated, IsDoctor]

    def patch(self, request, review_id):
        serializer = ReviewResponseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            review = Review.objects.get(
                id=review_id,
                doctor=request.user.doctor_profile
            )
        except Review.DoesNotExist:
            return Response(
                {'error': 'Отзыв не найден или не относится к вам.'},
                status=status.HTTP_404_NOT_FOUND
            )

        review.doctor_response = serializer.validated_data['doctor_response']
        review.doctor_response_date = timezone.now()
        review.save()

        return Response(ReviewSerializer(review).data)


class PatientReviewsView(APIView):
    """
    GET /api/patient/my-reviews/
    Пациент видит все свои отзывы.
    """
    permission_classes = [permissions.IsAuthenticated, IsPatient]

    def get(self, request):
        reviews = Review.objects.filter(patient=request.user).select_related(
            'doctor', 'appointment', 'appointment__slot'
        )
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)


class DoctorRatingStatsView(APIView):
    """
    GET /api/doctors/{doctor_id}/rating-stats/
    Статистика рейтинга врача (для отображения распределения оценок).
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, doctor_id):
        from django.db.models import Q

        reviews = Review.objects.filter(doctor_id=doctor_id, is_public=True)
        stats = reviews.aggregate(
            avg=Avg('rating'),
            count=Count('id')
        )

        # Распределение оценок
        distribution = {}
        for i in range(1, 6):
            distribution[str(i)] = reviews.filter(rating=i).count()

        return Response({
            'average_rating': round(stats['avg'] or 0, 1),
            'reviews_count': stats['count'] or 0,
            'rating_distribution': distribution
        })