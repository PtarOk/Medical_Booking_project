# reviews/admin.py

from django.contrib import admin
from django.utils import timezone
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    """Админка отзывов с модерацией и ответами врача."""

    list_display = ('patient', 'doctor', 'get_rating_stars', 'is_public', 'created_at')
    list_filter = ('rating', 'is_public', 'created_at')
    search_fields = (
        'patient__first_name', 'patient__last_name', 'patient__patronymic',
        'doctor__user__first_name', 'doctor__user__last_name',
        'comment', 'doctor_response',
    )

    # Запрещаем менять привязку — это защита от случайных ошибок
    readonly_fields = ('patient', 'doctor', 'appointment', 'created_at', 'updated_at')

    fieldsets = (
        ('Основная информация', {
            'fields': ('patient', 'doctor', 'appointment', 'rating', 'comment')
        }),
        ('Ответ врача', {
            'fields': ('doctor_response', 'doctor_response_date'),
            'classes': ('collapse',),
            'description': 'Заполните это поле, чтобы ответить пациенту. Дата ответа проставится автоматически.'
        }),
        ('Статус', {
            'fields': ('is_public', 'created_at', 'updated_at')
        }),
    )

    def get_rating_stars(self, obj):
        """Отображение рейтинга звёздами в списке."""
        return '⭐' * obj.rating
    get_rating_stars.short_description = 'Оценка'

    def save_model(self, request, obj, form, change):
        """Автоматически проставляем дату ответа, если врач написал ответ."""
        if obj.doctor_response and not obj.doctor_response_date:
            obj.doctor_response_date = timezone.now()
        super().save_model(request, obj, form, change)