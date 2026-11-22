# doctors/models.py

from django.db import models
from django.conf import settings
import uuid


class Doctor(models.Model):
    """
    Профиль врача.
    Расширенные поля для медицинской карточки.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='doctor_profile',
        verbose_name='Пользователь'
    )

    specialty = models.CharField(max_length=100, verbose_name='Специальность')
    bio = models.TextField(blank=True, verbose_name='О себе')
    photo = models.ImageField(upload_to='doctors/photos/', blank=True, verbose_name='Фото')
    consultation_duration = models.PositiveIntegerField(default=30, verbose_name='Длительность приёма (минуты)')
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Стоимость приёма')
    is_available = models.BooleanField(default=True, verbose_name='Принимает пациентов')

    # 👇 НОВЫЕ ПОЛЯ ДЛЯ ВРАЧА
    experience_years = models.PositiveIntegerField(
        default=0, verbose_name='Стаж работы (лет)'
    )
    education = models.CharField(
        max_length=255, blank=True, verbose_name='Образование / ВУЗ'
    )
    certificate_number = models.CharField(
        max_length=100, blank=True, verbose_name='Номер сертификата'
    )
    # 👇 НОВЫЕ ПОЛЯ ДЛЯ РЕЙТИНГА (кэшированные значения)
    average_rating = models.DecimalField(
        max_digits=3, decimal_places=1,
        default=0,
        verbose_name='Средний рейтинг'
    )
    reviews_count = models.PositiveIntegerField(
        default=0,
        verbose_name='Количество отзывов'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')

    class Meta:
        db_table = 'doctors'
        verbose_name = 'Врач'
        verbose_name_plural = 'Врачи'
        indexes = [
            models.Index(fields=['specialty']),
            models.Index(fields=['is_available']),
        ]

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} — {self.specialty}"

    @property
    def full_name(self):
        """Полное имя врача (без отчества — для карточек)."""
        return f"{self.user.first_name} {self.user.last_name}"

    @property
    def full_name_with_patronymic(self):
        """Полное ФИО с отчеством — для официальных документов."""
        patronymic = self.user.patronymic or ''
        return f"{self.user.first_name} {self.user.last_name} {patronymic}".strip()


class Schedule(models.Model):
    """Рабочее расписание врача по дням недели."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE,
        related_name='schedules',
        verbose_name='Врач'
    )

    DAY_CHOICES = [
        (0, 'Понедельник'),
        (1, 'Вторник'),
        (2, 'Среда'),
        (3, 'Четверг'),
        (4, 'Пятница'),
        (5, 'Суббота'),
        (6, 'Воскресенье'),
    ]

    day_of_week = models.IntegerField(choices=DAY_CHOICES, verbose_name='День недели')
    start_time = models.TimeField(verbose_name='Начало рабочего дня')
    end_time = models.TimeField(verbose_name='Конец рабочего дня')
    break_start = models.TimeField(blank=True, null=True, verbose_name='Начало обеда')
    break_end = models.TimeField(blank=True, null=True, verbose_name='Конец обеда')
    is_working_day = models.BooleanField(default=True, verbose_name='Рабочий день')

    class Meta:
        db_table = 'schedules'
        verbose_name = 'Расписание'
        verbose_name_plural = 'Расписания'
        unique_together = [['doctor', 'day_of_week']]
        indexes = [
            models.Index(fields=['doctor', 'day_of_week']),
        ]

    def __str__(self):
        return f"{self.doctor.full_name} — {self.get_day_of_week_display()}"


class TimeSlot(models.Model):
    """Конкретный временной слот для записи."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE,
        related_name='time_slots',
        verbose_name='Врач'
    )

    date = models.DateField(verbose_name='Дата')
    start_time = models.TimeField(verbose_name='Начало')
    end_time = models.TimeField(verbose_name='Конец')
    is_available = models.BooleanField(default=True, verbose_name='Доступен')

    class Meta:
        db_table = 'time_slots'
        verbose_name = 'Временной слот'
        verbose_name_plural = 'Временные слоты'
        unique_together = [['doctor', 'date', 'start_time']]
        ordering = ['date', 'start_time']
        indexes = [
            models.Index(fields=['doctor', 'date']),
            models.Index(fields=['date', 'is_available']),
        ]

    def __str__(self):
        return f"{self.doctor.full_name} — {self.date} {self.start_time}-{self.end_time}"