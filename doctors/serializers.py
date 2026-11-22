# doctors/serializers.py

from rest_framework import serializers
from .models import Doctor, Schedule, TimeSlot


class DoctorListSerializer(serializers.ModelSerializer):
    """
    Сериализатор для списка врачей (краткая информация).
    """
    full_name = serializers.SerializerMethodField()
    next_available_slot = serializers.SerializerMethodField()
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Doctor
        fields = [
            'id', 'full_name', 'specialty', 'photo',
            'price', 'consultation_duration', 'is_available',
            'next_available_slot', 'email', 'experience_years',
            'average_rating', 'reviews_count'
        ]

    def get_full_name(self, obj):
        first = obj.user.first_name or ''
        last = obj.user.last_name or ''
        patronymic = obj.user.patronymic or ''
        full = f"{first} {last} {patronymic}".strip()
        return full or obj.user.email or 'Врач'

    def get_next_available_slot(self, obj):
        from django.utils import timezone
        nearest_slot = TimeSlot.objects.filter(
            doctor=obj,
            is_available=True,
            date__gte=timezone.now().date()
        ).order_by('date', 'start_time').first()

        if nearest_slot:
            return {
                'date': nearest_slot.date.isoformat(),
                'start_time': nearest_slot.start_time.strftime('%H:%M'),
            }
        return None


class DoctorDetailSerializer(serializers.ModelSerializer):
    """
    Сериализатор для детальной страницы врача.
    """
    full_name = serializers.SerializerMethodField()
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Doctor
        fields = [
            'id', 'full_name', 'email', 'specialty', 'bio',
            'photo', 'price', 'consultation_duration',
            'is_available', 'experience_years', 'education',
            'certificate_number', 'created_at',
            'average_rating', 'reviews_count'
        ]

    def get_full_name(self, obj):
        first = obj.user.first_name or ''
        last = obj.user.last_name or ''
        patronymic = obj.user.patronymic or ''
        full = f"{first} {last} {patronymic}".strip()
        return full or obj.user.email or 'Врач'


class DoctorUpdateSerializer(serializers.ModelSerializer):
    """
    Сериализатор для редактирования профиля врача.
    photo сделан read_only, чтобы PATCH работал через JSON.
    Загрузка фото — отдельной задачей позже.
    """

    class Meta:
        model = Doctor
        fields = [
            'specialty', 'bio', 'price',
            'consultation_duration', 'is_available',
            'experience_years', 'education', 'certificate_number'
        ]
        read_only_fields = ['photo']


class ScheduleSerializer(serializers.ModelSerializer):
    """
    Сериализатор для расписания врача.
    """

    class Meta:
        model = Schedule
        fields = [
            'id', 'day_of_week', 'start_time', 'end_time',
            'break_start', 'break_end', 'is_working_day'
        ]


class TimeSlotSerializer(serializers.ModelSerializer):
    """
    Сериализатор для временного слота.
    """

    class Meta:
        model = TimeSlot
        fields = ['id', 'date', 'start_time', 'end_time', 'is_available']
        read_only_fields = ['id']


class TimeSlotListSerializer(serializers.ModelSerializer):
    """
    Сериализатор для списка слотов (только время и доступность).
    """

    class Meta:
        model = TimeSlot
        fields = ['id', 'start_time', 'end_time', 'is_available']