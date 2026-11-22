# users/models.py

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    """
    Кастомный менеджер для модели User.
    Позволяет создавать пользователей и суперпользователей по email.
    """

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email обязателен для заполнения')

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', self.model.Role.ADMIN)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Суперпользователь должен иметь is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Суперпользователь должен иметь is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """
    Кастомная модель пользователя.
    Расширенные поля для медицинского сервиса.
    """

    username = None  # Отключаем username, используем email

    # Django сам создаст поле id как BigAutoField (число). Это 100% работает с MSSQL.

    email = models.EmailField(unique=True, verbose_name='Email')
    phone = models.CharField(max_length=20, blank=True, verbose_name='Телефон')

    # 👇 НОВЫЕ ОБЩИЕ ПОЛЯ
    patronymic = models.CharField(
        max_length=100, blank=True, verbose_name='Отчество'
    )
    date_of_birth = models.DateField(
        null=True, blank=True, verbose_name='Дата рождения'
    )

    GENDER_CHOICES = [
        ('M', 'Мужской'),
        ('F', 'Женский'),
    ]
    gender = models.CharField(
        max_length=1,
        choices=GENDER_CHOICES,
        blank=True,
        null=True,
        verbose_name='Пол'
    )
    address = models.TextField(
        blank=True, null=True, verbose_name='Адрес проживания'
    )

    # 👇 НОВЫЕ ПОЛЯ ДЛЯ ЭКСТРЕННОГО КОНТАКТА (актуально для пациентов)
    emergency_contact_name = models.CharField(
        max_length=150, blank=True, verbose_name='ФИО контактного лица'
    )
    emergency_contact_phone = models.CharField(
        max_length=20, blank=True, verbose_name='Телефон контактного лица'
    )

    class Role(models.TextChoices):
        PATIENT = 'patient', 'Пациент'
        DOCTOR = 'doctor', 'Врач'
        ADMIN = 'admin', 'Администратор'

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.PATIENT,
        verbose_name='Роль'
    )

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        db_table = 'users'
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

    def __str__(self):
        full = f"{self.last_name} {self.first_name}"
        if self.patronymic:
            full += f" {self.patronymic}"
        return f"{full} ({self.get_role_display()})"

    @property
    def full_name_with_patronymic(self):
        """Возвращает полное ФИО с отчеством."""
        parts = [self.last_name, self.first_name, self.patronymic]
        return ' '.join(p for p in parts if p)