# users/urls.py

from django.urls import path
from . import views

app_name = 'users'  # Пространство имён для URL

urlpatterns = [
    # Аутентификация
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/refresh/', views.TokenRefreshAPIView.as_view(), name='token_refresh'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
    
    # Профиль пользователя
    path('auth/me/', views.UserProfileView.as_view(), name='user_profile'),
    
    # Смена пароля
    path('auth/change-password/', views.ChangePasswordView.as_view(), name='change_password'),
]