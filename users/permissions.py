# users/permissions.py

from rest_framework import permissions


class IsPatient(permissions.BasePermission):
    """Разрешает доступ только пациентам."""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'patient'


class IsDoctor(permissions.BasePermission):
    """Разрешает доступ только врачам."""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'doctor'


class IsAdmin(permissions.BasePermission):
    """Разрешает доступ только администраторам."""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Только владелец объекта может его редактировать.
    Остальные — только читать.
    """
    
    def has_object_permission(self, request, view, obj):
        # GET, HEAD, OPTIONS — всегда разрешены
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Проверяем, является ли пользователь владельцем
        # Работает для Appointment (patient), Doctor (user) и т.д.
        if hasattr(obj, 'patient'):
            return obj.patient == request.user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        return False


class IsDoctorOwner(permissions.BasePermission):
    """
    Врач может управлять только своими данными.
    """
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Если у объекта есть doctor, проверяем совпадение
        if hasattr(obj, 'doctor'):
            return obj.doctor.user == request.user
        
        # Если сам объект — Doctor
        from doctors.models import Doctor
        if isinstance(obj, Doctor):
            return obj.user == request.user
        
        return False