from django.contrib import admin
from .models import TimeSlot, ParkingZone, ParkingSlot, Booking


@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display = ['date', 'start_time', 'end_time', 'capacity', 'booked_count', 'available_slots', 'is_active']
    list_filter = ['date', 'is_active']
    list_editable = ['capacity', 'is_active']
    ordering = ['date', 'start_time']


@admin.register(ParkingZone)
class ParkingZoneAdmin(admin.ModelAdmin):
    list_display = ['name', 'total_slots', 'is_covered', 'is_active']
    list_editable = ['is_active']


@admin.register(ParkingSlot)
class ParkingSlotAdmin(admin.ModelAdmin):
    list_display = ['slot_number', 'zone', 'status', 'is_active']
    list_filter = ['zone', 'status', 'is_active']
    list_editable = ['status', 'is_active']
    search_fields = ['slot_number']


class BookingServicesInline(admin.TabularInline):
    model = Booking.car_wash_services.through
    verbose_name = 'Car Wash Service'
    extra = 0


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = [
        'booking_id', 'customer', 'vehicle', 'time_slot',
        'parking_slot', 'status', 'payment_status', 'final_amount', 'created_at'
    ]
    list_filter = ['status', 'payment_status', 'time_slot__date']
    search_fields = ['booking_id', 'customer__email', 'vehicle__registration_number']
    readonly_fields = ['booking_id', 'created_at', 'updated_at']
    ordering = ['-created_at']
    raw_id_fields = ['customer', 'vehicle', 'time_slot', 'parking_slot']
