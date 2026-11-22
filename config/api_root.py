# config/api_root.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.reverse import reverse


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request, format=None):
    """
    Корневая страница API. Показывает список всех доступных endpoints.
    """
    return Response({
        'auth': {
            'register': reverse('users:register', request=request, format=format),
            'login': reverse('users:login', request=request, format=format),
            'refresh': reverse('users:token_refresh', request=request, format=format),
            'logout': reverse('users:logout', request=request, format=format),
            'me': reverse('users:user_profile', request=request, format=format),
            'change-password': reverse('users:change_password', request=request, format=format),
        },
        'doctors': reverse('doctors:doctor-list', request=request, format=format),
        'doctor-schedules': reverse('doctors:doctor-schedule-list', request=request, format=format),
        'doctor-timeslots': reverse('doctors:doctor-timeslot-list', request=request, format=format),
        'appointments': reverse('appointments:appointment-list', request=request, format=format),
    })