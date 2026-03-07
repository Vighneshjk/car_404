from rest_framework import serializers
from .models import Vehicle
from services.serializers import VehicleCategorySerializer


class VehicleSerializer(serializers.ModelSerializer):
    category_detail = VehicleCategorySerializer(source='category', read_only=True)
    owner_name = serializers.CharField(source='owner.full_name', read_only=True)

    class Meta:
        model = Vehicle
        fields = [
            'id', 'owner', 'owner_name', 'category', 'category_detail',
            'registration_number', 'make', 'model', 'year', 'color',
            'fuel_type', 'image', 'notes', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'owner', 'created_at']

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)


class VehicleListSerializer(serializers.ModelSerializer):
    """Compact serializer for listings/dropdowns."""
    category_name = serializers.CharField(source='category.get_name_display', read_only=True)

    class Meta:
        model = Vehicle
        fields = ['id', 'registration_number', 'make', 'model', 'year', 'color', 'category_name', 'fuel_type']
