# appointments/models.py

from django.db import models
from django.conf import settings
from doctors.models import Doctor, TimeSlot
from django.utils import timezone
import uuid


class Appointment(models.Model):
    """Запись пациента к врачу."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='appointments',
        limit_choices_to={'role': 'patient'},
        verbose_name='Пациент'
    )

    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE,
        related_name='appointments',
        verbose_name='Врач'
    )

    slot = models.OneToOneField(
        TimeSlot,
        on_delete=models.CASCADE,
        related_name='appointment',
        verbose_name='Временной слот'
    )

    class Status(models.TextChoices):
        PENDING = 'pending', 'Ожидает подтверждения'
        CONFIRMED = 'confirmed', 'Подтверждена'
        CANCELLED = 'cancelled', 'Отменена'
        COMPLETED = 'completed', 'Завершена'

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        verbose_name='Статус'
    )

    notes = models.TextField(blank=True, verbose_name='Примечания')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    cancelled_at = models.DateTimeField(blank=True, null=True, verbose_name='Дата отмены')
    reminder_sent = models.BooleanField(default=False, verbose_name='Напоминание отправлено')

    # 👇 ДОБАВЛЕНО: db_table = 'appointments'
    class Meta:
        db_table = 'appointments'
        verbose_name = 'Запись'
        verbose_name_plural = 'Записи'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['patient', 'status']),
            models.Index(fields=['doctor']),
            models.Index(fields=['slot']),
        ]

    def __str__(self):
        return f"{self.patient.first_name} → {self.doctor.full_name} ({self.slot.date} {self.slot.start_time})"

    def cancel(self):
        """Отменить запись."""
        self.status = self.Status.CANCELLED
        self.cancelled_at = timezone.now()
        self.slot.is_available = True
        self.slot.save()
        self.save()