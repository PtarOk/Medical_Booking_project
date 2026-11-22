# reviews/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'reviews'

router = DefaultRouter()
router.register(r'doctors/(?P<doctor_pk>[^/.]+)/reviews', views.DoctorReviewsViewSet, basename='doctor-review')

urlpatterns = [
    path('', include(router.urls)),
    path('reviews/<uuid:review_id>/response/', views.ReviewResponseView.as_view(), name='review-response'),
    path('patient/my-reviews/', views.PatientReviewsView.as_view(), name='patient-reviews'),
    path('doctors/<uuid:doctor_id>/rating-stats/', views.DoctorRatingStatsView.as_view(), name='doctor-rating-stats'),
]