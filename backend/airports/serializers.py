from rest_framework import serializers
from .models import Airport, FacilityLocation


class AirportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Airport
        fields = ['id', 'name', 'code', 'city', 'distance_km', 'drive_minutes']


class FacilityLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = FacilityLocation
        fields = [
            'id', 'name', 'address_line1', 'address_line2',
            'city', 'state', 'pincode', 'latitude', 'longitude',
            'google_maps_url', 'phone', 'email', 'working_hours'
        ]
