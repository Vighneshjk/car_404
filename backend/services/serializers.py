from rest_framework import serializers
from .models import (
    VehicleCategory, ServiceCategory,
    CarWashService, CeramicCoatingType, ServicePricing
)


class VehicleCategorySerializer(serializers.ModelSerializer):
    name_display = serializers.CharField(source='get_name_display', read_only=True)

    class Meta:
        model = VehicleCategory
        fields = ['id', 'name', 'name_display', 'description', 'icon']


class ServiceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCategory
        fields = ['id', 'name', 'slug', 'description', 'icon', 'order']


class ServicePricingSerializer(serializers.ModelSerializer):
    vehicle_category = VehicleCategorySerializer(read_only=True)
    effective_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = ServicePricing
        fields = ['id', 'vehicle_category', 'price', 'discounted_price', 'effective_price']


class CarWashServiceSerializer(serializers.ModelSerializer):
    category = ServiceCategorySerializer(read_only=True)
    pricing = ServicePricingSerializer(many=True, read_only=True)
    wash_type_display = serializers.CharField(source='get_wash_type_display', read_only=True)

    class Meta:
        model = CarWashService
        fields = [
            'id', 'category', 'name', 'wash_type', 'wash_type_display',
            'description', 'includes', 'estimated_duration_minutes',
            'is_featured', 'image', 'pricing'
        ]


class CeramicCoatingTypeSerializer(serializers.ModelSerializer):
    category = ServiceCategorySerializer(read_only=True)
    pricing = ServicePricingSerializer(many=True, read_only=True)
    coating_type_display = serializers.CharField(source='get_coating_type_display', read_only=True)

    class Meta:
        model = CeramicCoatingType
        fields = [
            'id', 'category', 'name', 'coating_type', 'coating_type_display',
            'description', 'includes', 'warranty_months', 'gloss_level',
            'layers', 'estimated_duration_hours', 'is_featured', 'image', 'pricing'
        ]


class ServicePricingDetailSerializer(serializers.ModelSerializer):
    car_wash = CarWashServiceSerializer(read_only=True)
    ceramic_coating = CeramicCoatingTypeSerializer(read_only=True)
    vehicle_category = VehicleCategorySerializer(read_only=True)
    effective_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = ServicePricing
        fields = ['id', 'car_wash', 'ceramic_coating', 'vehicle_category', 'price', 'discounted_price', 'effective_price']
