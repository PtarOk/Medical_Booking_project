# config/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from .api_root import api_root  # ← Импорт корневой страницы API

urlpatterns = [
    # Админка Django
    path('admin/', admin.site.urls),

    # Корневая страница API
    path('api/', api_root, name='api-root'),

    # Наши API endpoints
    path('api/', include('users.urls')),
    path('api/', include('doctors.urls')),
    path('api/', include('reviews.urls')),

    # 👇 ДОБАВЛЕНА ВОТ ЭТА СТРОКА:
    path('api/', include('appointments.urls')),
]

# Добавляем раздачу медиа-файлов в режиме разработки
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)