# users/views.py

from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth import get_user_model

from .serializers import (
    UserRegisterSerializer,
    UserLoginSerializer,
    UserSerializer,
    ChangePasswordSerializer,
)
from .permissions import IsOwnerOrReadOnly

User = get_user_model()


# ============================================================
# РЕГИСТРАЦИЯ
# ============================================================

class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/
    Регистрация нового пользователя.
    Доступно всем (даже неавторизованным).
    """
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response({
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
            'message': 'Регистрация успешна.'
        }, status=status.HTTP_201_CREATED)


# ============================================================
# ВХОД (LOGIN)
# ============================================================

class LoginView(TokenObtainPairView):
    """
    POST /api/auth/login/
    Вход в систему. Возвращает JWT токены + данные пользователя.
    """
    serializer_class = UserLoginSerializer


# ============================================================
# ОБНОВЛЕНИЕ ТОКЕНА
# ============================================================

class TokenRefreshAPIView(TokenRefreshView):
    """
    POST /api/auth/refresh/
    Обновление access-токена через refresh.
    """
    pass


# ============================================================
# ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ (me)
# ============================================================

class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    GET  /api/auth/me/  — получить свой профиль
    PATCH /api/auth/me/  — обновить свой профиль

    Только авторизованные пользователи.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        """Возвращаем текущего пользователя."""
        return self.request.user


# ============================================================
# СМЕНА ПАРОЛЯ
# ============================================================

class ChangePasswordView(APIView):
    """
    POST /api/auth/change-password/
    Смена пароля для авторизованного пользователя.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user

        # Проверяем старый пароль
        if not user.check_password(serializer.validated_data['old_password']):
            return Response(
                {'error': 'Неверный текущий пароль.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Устанавливаем новый пароль
        user.set_password(serializer.validated_data['new_password'])
        user.save()

        return Response(
            {'message': 'Пароль успешно изменён.'},
            status=status.HTTP_200_OK
        )


# ============================================================
# ВЫХОД (LOGOUT)
# ============================================================

class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Выход из системы.
    На клиенте нужно просто удалить токены.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # В простой реализации — просто возвращаем успех
        # В продакшене можно добавить blacklist токенов
        return Response(
            {'message': 'Выход выполнен успешно.'},
            status=status.HTTP_200_OK
        )