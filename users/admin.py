# users/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """
    Кастомная админка для модели User.
    Использует email вместо username, добавлены новые поля профиля.
    """

    # Группировка полей при редактировании
    fieldsets = (
        (None, {
            'fields': ('email', 'password')
        }),
        (_('Личная информация'), {
            'fields': ('first_name', 'last_name', 'patronymic', 'role', 'date_of_birth', 'gender')
        }),
        (_('Контактные данные'), {
            'fields': ('phone', 'address')
        }),
        (_('Экстренный контакт'), {
            'fields': ('emergency_contact_name', 'emergency_contact_phone'),
            'classes': ('collapse',),
        }),
        (_('Права доступа'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Системные даты'), {
            'fields': ('last_login', 'date_joined'),
            'classes': ('collapse',),
        }),
    )

    # Поля при создании нового пользователя через админку
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'patronymic', 'role', 'password1', 'password2'),
        }),
    )

    # Столбцы в списке пользователей
    list_display = ('email', 'get_full_name', 'role', 'phone', 'is_active', 'is_staff')

    # Фильтры в правой колонке
    list_filter = ('role', 'is_active', 'is_staff', 'is_superuser', 'gender', 'date_joined')

    # Поля для поиска
    search_fields = ('email', 'first_name', 'last_name', 'patronymic', 'phone', 'address')

    ordering = ('email',)

    def get_full_name(self, obj):
        """Возвращает полное ФИО для отображения в списке."""
        return f"{obj.last_name} {obj.first_name} {obj.patronymic or ''}".strip()
    get_full_name.short_description = 'ФИО'