from django.contrib import admin
from .models import Vehicle


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ['registration_number', 'make', 'model', 'year', 'color', 'category', 'owner', 'is_active']
    list_filter = ['category', 'fuel_type', 'is_active']
    search_fields = ['registration_number', 'make', 'model', 'owner__email']
    raw_id_fields = ['owner']
