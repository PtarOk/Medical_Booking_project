from django.contrib import admin
from .models import Appointment

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('patient', 'doctor', 'slot', 'status', 'created_at')
    list_filter = ('status', 'slot__date')
    search_fields = ('patient__first_name', 'patient__last_name', 'doctor__user__first_name')