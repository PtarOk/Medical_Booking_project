# appointments/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'appointments'

# Router автоматически создает все нужные URL для нашего ViewSet
router = DefaultRouter()
router.register(r'appointments', views.AppointmentViewSet, basename='appointment')

urlpatterns = [
    path('', include(router.urls)),
]