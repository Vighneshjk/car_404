from django.contrib import admin
from .models import VehicleCategory, ServiceCategory, CarWashService, CeramicCoatingType, ServicePricing


@admin.register(VehicleCategory)
class VehicleCategoryAdmin(admin.ModelAdmin):
    list_display = ['get_name_display', 'description']


@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'is_active', 'order']
    list_editable = ['is_active', 'order']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(CarWashService)
class CarWashServiceAdmin(admin.ModelAdmin):
    list_display = ['name', 'wash_type', 'estimated_duration_minutes', 'is_active', 'is_featured']
    list_filter = ['wash_type', 'is_active', 'is_featured']
    list_editable = ['is_active', 'is_featured']
    search_fields = ['name']


@admin.register(CeramicCoatingType)
class CeramicCoatingAdmin(admin.ModelAdmin):
    list_display = ['name', 'coating_type', 'warranty_months', 'gloss_level', 'layers', 'is_active', 'is_featured']
    list_filter = ['coating_type', 'is_active', 'is_featured']
    list_editable = ['is_active', 'is_featured']
    search_fields = ['name']


@admin.register(ServicePricing)
class ServicePricingAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'price', 'discounted_price', 'is_active']
    list_filter = ['vehicle_category', 'is_active']
    list_editable = ['price', 'discounted_price', 'is_active']
