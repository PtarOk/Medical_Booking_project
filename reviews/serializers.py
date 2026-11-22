# reviews/serializers.py

from rest_framework import serializers
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    """Сериализатор для отзыва (полный, с данными пациента)."""

    patient_name = serializers.SerializerMethodField()
    patient_photo = serializers.SerializerMethodField()
    appointment_date = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            'id', 'patient', 'patient_name', 'patient_photo',
            'doctor', 'appointment', 'appointment_date',
            'rating', 'comment',
            'doctor_response', 'doctor_response_date',
            'is_public', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'patient', 'doctor', 'appointment', 'created_at', 'updated_at']

    def get_patient_name(self, obj):
        return f"{obj.patient.last_name} {obj.patient.first_name} {obj.patient.patronymic or ''}".strip()

    def get_patient_photo(self, obj):
        # Если в будущем добавим фото пациентов
        return None

    def get_appointment_date(self, obj):
        if obj.appointment and obj.appointment.slot:
            return obj.appointment.slot.date.isoformat()
        return None


class ReviewCreateSerializer(serializers.ModelSerializer):
    """
    Сериализатор для создания отзыва.
    Пациент указывает только rating и comment.
    doctor и appointment определяются на сервере.
    """

    appointment_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = Review
        fields = ['appointment_id', 'rating', 'comment']

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Оценка должна быть от 1 до 5.")
        return value

    def validate_appointment_id(self, value):
        """Проверяем, что запись существует, завершена и принадлежит пациенту."""
        from appointments.models import Appointment

        try:
            appointment = Appointment.objects.get(id=value)
        except Appointment.DoesNotExist:
            raise serializers.ValidationError("Запись не найдена.")

        # Проверяем, что запись принадлежит текущему пациенту
        request = self.context.get('request')
        if appointment.patient != request.user:
            raise serializers.ValidationError("Вы не можете оставить отзыв по чужой записи.")

        # Проверяем статус записи
        if appointment.status != 'completed':
            raise serializers.ValidationError(
                "Отзыв можно оставить только по завершённой записи."
            )

        # Проверяем, что отзыв ещё не оставлен
        if Review.objects.filter(appointment=appointment).exists():
            raise serializers.ValidationError("Отзыв по этой записи уже существует.")

        return value


class ReviewResponseSerializer(serializers.Serializer):
    """Сериализатор для ответа врача на отзыв."""

    doctor_response = serializers.CharField(required=True, max_length=1000)

    def validate_doctor_response(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Ответ должен содержать минимум 10 символов.")
        return value


class DoctorRatingSerializer(serializers.Serializer):
    """Агрегированные данные о рейтинге врача."""

    average_rating = serializers.FloatField()
    reviews_count = serializers.IntegerField()
    rating_distribution = serializers.DictField()  # {1: 2, 2: 1, 3: 5, 4: 10, 5: 20}