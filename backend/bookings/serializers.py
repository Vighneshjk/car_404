from rest_framework import serializers
from django.utils import timezone
from .models import TimeSlot, ParkingZone, ParkingSlot, Booking
from vehicles.serializers import VehicleListSerializer
from services.serializers import CarWashServiceSerializer, CeramicCoatingTypeSerializer


class TimeSlotSerializer(serializers.ModelSerializer):
    available_slots = serializers.IntegerField(read_only=True)
    is_available = serializers.BooleanField(read_only=True)
    start_time_display = serializers.SerializerMethodField()
    end_time_display = serializers.SerializerMethodField()

    class Meta:
        model = TimeSlot
        fields = [
            'id', 'date', 'start_time', 'end_time',
            'start_time_display', 'end_time_display',
            'capacity', 'booked_count', 'available_slots',
            'is_available', 'notes'
        ]

    def get_start_time_display(self, obj):
        return obj.start_time.strftime('%I:%M %p')

    def get_end_time_display(self, obj):
        return obj.end_time.strftime('%I:%M %p')


class ParkingZoneSerializer(serializers.ModelSerializer):
    available_count = serializers.SerializerMethodField()

    class Meta:
        model = ParkingZone
        fields = ['id', 'name', 'description', 'total_slots', 'is_covered', 'available_count']

    def get_available_count(self, obj):
        return obj.slots.filter(status='available', is_active=True).count()


class ParkingSlotSerializer(serializers.ModelSerializer):
    zone_name = serializers.CharField(source='zone.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_free = serializers.BooleanField(read_only=True)

    class Meta:
        model = ParkingSlot
        fields = ['id', 'zone', 'zone_name', 'slot_number', 'status', 'status_display', 'is_free', 'notes']


class BookingCreateSerializer(serializers.ModelSerializer):
    car_wash_services = serializers.PrimaryKeyRelatedField(
        many=True, queryset=__import__('services.models', fromlist=['CarWashService']).CarWashService.objects.filter(is_active=True),
        required=False
    )
    ceramic_coatings = serializers.PrimaryKeyRelatedField(
        many=True, queryset=__import__('services.models', fromlist=['CeramicCoatingType']).CeramicCoatingType.objects.filter(is_active=True),
        required=False
    )

    class Meta:
        model = Booking
        fields = [
            'vehicle', 'time_slot', 'parking_slot',
            'car_wash_services', 'ceramic_coatings',
            'special_requests'
        ]

    def validate_time_slot(self, value):
        if not value.is_available:
            raise serializers.ValidationError('This time slot is not available.')
        return value

    def validate_parking_slot(self, value):
        if value and not value.is_free:
            raise serializers.ValidationError('This parking slot is not available.')
        return value

    def validate(self, data):
        if not data.get('car_wash_services') and not data.get('ceramic_coatings'):
            raise serializers.ValidationError('Please select at least one service.')
        vehicle = data.get('vehicle')
        request = self.context['request']
        if vehicle.owner != request.user:
            raise serializers.ValidationError({'vehicle': 'You can only book for your own vehicle.'})
        return data

    def create(self, validated_data):
        car_wash_services = validated_data.pop('car_wash_services', [])
        ceramic_coatings = validated_data.pop('ceramic_coatings', [])
        validated_data['customer'] = self.context['request'].user

        booking = Booking.objects.create(**validated_data)
        booking.car_wash_services.set(car_wash_services)
        booking.ceramic_coatings.set(ceramic_coatings)


        from services.models import ServicePricing
        vehicle_cat = booking.vehicle.category
        total = 0
        for service in car_wash_services:
            try:
                pricing = ServicePricing.objects.get(car_wash=service, vehicle_category=vehicle_cat)
                total += pricing.effective_price
            except ServicePricing.DoesNotExist:
                pass
        for coating in ceramic_coatings:
            try:
                pricing = ServicePricing.objects.get(ceramic_coating=coating, vehicle_category=vehicle_cat)
                total += pricing.effective_price
            except ServicePricing.DoesNotExist:
                pass

        booking.total_amount = total
        booking.final_amount = total
        booking.save()
        return booking


class BookingDetailSerializer(serializers.ModelSerializer):
    vehicle = VehicleListSerializer(read_only=True)
    time_slot = TimeSlotSerializer(read_only=True)
    parking_slot = ParkingSlotSerializer(read_only=True)
    car_wash_services = CarWashServiceSerializer(many=True, read_only=True)
    ceramic_coatings = CeramicCoatingTypeSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    customer_email = serializers.CharField(source='customer.email', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'booking_id', 'customer', 'customer_name', 'customer_email', 'customer_phone',
            'vehicle', 'time_slot', 'parking_slot',
            'car_wash_services', 'ceramic_coatings',
            'status', 'status_display', 'payment_status', 'payment_status_display',
            'total_amount', 'discount_amount', 'final_amount',
            'special_requests', 'internal_notes',
            'created_at', 'updated_at', 'confirmed_at', 'completed_at'
        ]
        read_only_fields = ['id', 'booking_id', 'customer', 'created_at', 'updated_at']


class BookingListSerializer(serializers.ModelSerializer):
    """Compact serializer for booking lists."""
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    vehicle_reg = serializers.CharField(source='vehicle.registration_number', read_only=True)
    time_slot_display = serializers.CharField(source='time_slot.__str__', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'booking_id', 'customer_name', 'vehicle_reg',
            'time_slot_display', 'status', 'status_display',
            'final_amount', 'payment_status', 'created_at'
        ]
