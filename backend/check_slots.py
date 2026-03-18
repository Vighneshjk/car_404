import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from bookings.models import TimeSlot, Booking, ParkingSlot

print("--- Time Slots ---")
for ts in TimeSlot.objects.all():
    bookings_count = Booking.objects.filter(time_slot=ts).exclude(status='cancelled').count()
    print(f"Slot: {ts}, Capacity: {ts.capacity}, Booked Count (model): {ts.booked_count}, Actual Booked (DB): {bookings_count}")

print("\n--- Parking Slots ---")
for ps in ParkingSlot.objects.all():
    booking = Booking.objects.filter(parking_slot=ps).exclude(status__in=['completed', 'cancelled']).first()
    print(f"Slot: {ps.slot_number}, Status: {ps.status}, Booking: {booking.booking_id if booking else 'None'}")
