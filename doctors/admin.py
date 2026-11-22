# doctors/admin.py

from django.contrib import admin
from .models import Doctor, Schedule, TimeSlot


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    """Админка профиля врача с отображением рейтинга."""

    list_display = (
        'get_full_name',
        'specialty',
        'experience_years',
        'get_rating_display',
        'price',
        'is_available',
    )

    list_filter = ('specialty', 'is_available', 'experience_years')

    search_fields = (
        'user__first_name', 'user__last_name', 'user__patronymic',
        'specialty', 'education', 'certificate_number',
    )

    fieldsets = (
        ('Основная информация', {
            'fields': ('user', 'specialty', 'photo')
        }),
        ('Профессиональные данные', {
            'fields': ('experience_years', 'education', 'certificate_number', 'bio')
        }),
        ('Условия приёма', {
            'fields': ('price', 'consultation_duration', 'is_available')
        }),
        ('Статистика (автоматически)', {
            'fields': ('average_rating', 'reviews_count'),
            'classes': ('collapse',),
            'description': 'Эти поля обновляются автоматически при добавлении/удалении отзывов.'
        }),
    )

    readonly_fields = ('average_rating', 'reviews_count')

    def get_full_name(self, obj):
        """Полное ФИО врача."""
        return f"{obj.user.last_name} {obj.user.first_name} {obj.user.patronymic or ''}".strip()
    get_full_name.short_description = 'ФИО Врача'

    def get_rating_display(self, obj):
        """Красивое отображение рейтинга в списке."""
        if obj.average_rating and obj.average_rating > 0:
            return f"⭐ {obj.average_rating:.1f} ({obj.reviews_count})"
        return "— нет отзывов —"
    get_rating_display.short_description = 'Рейтинг'


@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ('doctor', 'get_day_of_week_display', 'start_time', 'end_time', 'is_working_day')
    list_filter = ('day_of_week', 'is_working_day')
    search_fields = ('doctor__user__first_name', 'doctor__user__last_name', 'doctor__user__patronymic')


@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display = ('doctor', 'date', 'start_time', 'end_time', 'is_available')
    list_filter = ('date', 'is_available')
    search_fields = ('doctor__user__first_name', 'doctor__user__last_name', 'doctor__user__patronymic')

    # Предупреждение: поля слота лучше не менять вручную
    def get_readonly_fields(self, request, obj=None):
        if obj:  # при редактировании существующего слота
            return ('doctor', 'date', 'start_time', 'end_time')
        return self.readonly_fields