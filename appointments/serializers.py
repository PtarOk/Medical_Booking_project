# appointments/serializers.py

from rest_framework import serializers
from .models import Appointment
from doctors.models import TimeSlot, Doctor
from doctors.serializers import DoctorListSerializer, TimeSlotSerializer
from django.utils import timezone
from datetime import datetime


class AppointmentCreateSerializer(serializers.ModelSerializer):
    """
    Сериализатор для создания новой записи.
    """
    doctor_id = serializers.UUIDField(write_only=True)
    slot_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = Appointment
        fields = ['id', 'doctor_id', 'slot_id', 'notes', 'status', 'created_at']
        read_only_fields = ['id', 'status', 'created_at']

    def validate(self, data):
        """
        Проверяем:
        1. Врач существует
        2. Слот существует и принадлежит этому врачу
        3. Слот свободен
        4. Слот не в прошлом
        """
        # Проверяем врача
        try:
            doctor = Doctor.objects.get(id=data['doctor_id'])
        except Doctor.DoesNotExist:
            raise serializers.ValidationError({
                'doctor_id': 'Врач не найден.'
            })

        # Проверяем слот (select_for_update блокирует строку до конца транзакции)
        try:
            slot = TimeSlot.objects.select_for_update().get(id=data['slot_id'])
        except TimeSlot.DoesNotExist:
            raise serializers.ValidationError({
                'slot_id': 'Временной слот не найден.'
            })

        # Слот должен принадлежать этому врачу
        if slot.doctor != doctor:
            raise serializers.ValidationError({
                'slot_id': 'Этот слот не принадлежит указанному врачу.'
            })

        # Слот должен быть свободен
        if not slot.is_available:
            raise serializers.ValidationError({
                'slot_id': 'Этот временной слот уже занят.'
            })

        # Слот не должен быть в прошлом
        slot_datetime = timezone.make_aware(
            datetime.combine(slot.date, slot.start_time)
        )
        if slot_datetime < timezone.now():
            raise serializers.ValidationError({
                'slot_id': 'Нельзя записаться на прошедшее время.'
            })

        # Сохраняем объекты для использования в create()
        data['doctor'] = doctor
        data['slot'] = slot

        return data

    def create(self, validated_data):
        """Создаём запись и помечаем слот как занятый."""
        doctor = validated_data.pop('doctor')
        slot = validated_data.pop('slot')

        # Создаём запись
        appointment = Appointment.objects.create(
            doctor=doctor,
            slot=slot,
            **validated_data
        )

        # Помечаем слот как занятый
        slot.is_available = False
        slot.save()

        return appointment


class AppointmentSerializer(serializers.ModelSerializer):
    """
    Сериализатор для отображения записи.
    """
    doctor = DoctorListSerializer(read_only=True)
    slot = TimeSlotSerializer(read_only=True)
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'patient_name', 'doctor', 'slot',
            'status', 'notes', 'created_at', 'cancelled_at'
        ]
        read_only_fields = fields


class AppointmentCancelSerializer(serializers.Serializer):
    """
    Сериализатор для отмены записи.
    """
    reason = serializers.CharField(required=False, allow_blank=True)