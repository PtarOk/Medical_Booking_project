# users/serializers.py

from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UserRegisterSerializer(serializers.ModelSerializer):
    """
    Сериализатор для регистрации нового пользователя.
    """
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'patronymic',
            'phone', 'role', 'password', 'password_confirm'
        ]
        extra_kwargs = {
            'id': {'read_only': True},
            'patronymic': {'required': False},
        }

    def validate(self, data):
        """Проверяем, что пароли совпадают."""
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Пароли не совпадают.'
            })
        return data

    def create(self, validated_data):
        """Создаём пользователя, удаляя password_confirm из данных."""
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(TokenObtainPairSerializer):
    """
    Кастомный сериализатор для входа.
    Возвращает JWT-токены + данные пользователя.
    """

    def validate(self, attrs):
        # Стандартная валидация JWT
        data = super().validate(attrs)

        # Добавляем данные пользователя в ответ
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'patronymic': self.user.patronymic,
            'phone': self.user.phone,
            'role': self.user.role,
        }

        return data


class UserSerializer(serializers.ModelSerializer):
    """
    Сериализатор для отображения и редактирования профиля пользователя.
    Редактируемые поля: first_name, last_name, patronymic, phone,
                        date_of_birth, gender, address,
                        emergency_contact_name, emergency_contact_phone.
    Только для чтения: id, email, role, date_joined.
    """

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'patronymic',
            'phone', 'date_of_birth', 'gender', 'address',
            'emergency_contact_name', 'emergency_contact_phone',
            'role', 'date_joined'
        ]
        read_only_fields = ['id', 'email', 'role', 'date_joined']


class ChangePasswordSerializer(serializers.Serializer):
    """
    Сериализатор для смены пароля.
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)

    def validate_new_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Пароль должен содержать минимум 8 символов.")
        return value