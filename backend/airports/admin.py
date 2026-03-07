from django.contrib import admin
from .models import Airport, FacilityLocation


@admin.register(Airport)
class AirportAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'city', 'distance_km', 'drive_minutes', 'is_active']
    list_editable = ['is_active']


@admin.register(FacilityLocation)
class FacilityLocationAdmin(admin.ModelAdmin):
    list_display = ['name', 'city', 'phone', 'email', 'is_primary']
