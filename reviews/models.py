# reviews/models.py

from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class Review(models.Model):
    """
    Отзыв пациента о враче.
    Привязан к конкретной завершённой записи.
    """

    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reviews_given',
        verbose_name='Пациент'
    )

    doctor = models.ForeignKey(
        'doctors.Doctor',
        on_delete=models.CASCADE,
        related_name='reviews_received',
        verbose_name='Врач'
    )

    appointment = models.OneToOneField(
        'appointments.Appointment',
        on_delete=models.CASCADE,
        related_name='review',
        verbose_name='Запись',
        help_text='Отзыв может быть оставлен только по завершённой записи'
    )

    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name='Оценка (1-5)'
    )

    comment = models.TextField(
        blank=True,
        verbose_name='Текст отзыва'
    )

    # Ответ врача
    doctor_response = models.TextField(
        blank=True,
        verbose_name='Ответ врача'
    )

    doctor_response_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Дата ответа врача'
    )

    is_public = models.BooleanField(
        default=True,
        verbose_name='Опубликован'
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата создания'
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Дата обновления'
    )

    class Meta:
        db_table = 'reviews'
        verbose_name = 'Отзыв'
        verbose_name_plural = 'Отзывы'
        ordering = ['-created_at']
        unique_together = [['patient', 'appointment']]  # один отзыв на одну запись
        indexes = [
            models.Index(fields=['doctor', 'rating']),
            models.Index(fields=['patient', 'created_at']),
        ]

    def __str__(self):
        return f"Отзыв от {self.patient} о {self.doctor} ({self.rating}★)"