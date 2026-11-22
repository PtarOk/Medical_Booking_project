# doctors/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'doctors'

router = DefaultRouter()
router.register(r'doctors', views.DoctorViewSet, basename='doctor')
router.register(r'doctor-schedules', views.DoctorScheduleViewSet, basename='doctor-schedule')
router.register(r'doctor-timeslots', views.DoctorTimeSlotViewSet, basename='doctor-timeslot')

urlpatterns = [
    # 👈 ВАЖНО: Этот путь должен быть ПЕРВЫМ, до router.urls!
    path('doctors/me/', views.MyDoctorProfileView.as_view(), name='my-doctor-profile'),

    path('', include(router.urls)),
    path('doctor/generate-slots/', views.GenerateSlotsView.as_view(), name='generate-slots'),
]