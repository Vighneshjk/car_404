import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from bookings.models import TimeSlot, Booking, ParkingSlot

def recalibrate():
    print("Recalibrating TimeSlot booked_count...")
    for ts in TimeSlot.objects.all():
        actual_count = Booking.objects.filter(time_slot=ts).exclude(status='cancelled').count()
        if ts.booked_count != actual_count:
            print(f"Updating {ts}: {ts.booked_count} -> {actual_count}")
            ts.booked_count = actual_count
            ts.save()
        else:
            print(f"Slot {ts} is correct ({actual_count})")

    print("\nChecking ParkingSlot statuses...")
    # Any parking slot that is NOT associated with an active booking should be AVAILABLE
    # Any parking slot associated with a pending/confirmed booking should be RESERVED
    # Any parking slot associated with an in_progress booking should be OCCUPIED
    
    # First, reset all to available (or keep current if no active booking)
    # Actually, let's be more precise.
    
    for ps in ParkingSlot.objects.all():
        active_booking = Booking.objects.filter(
            parking_slot=ps
        ).exclude(status__in=['completed', 'cancelled']).first()
        
        expected_status = ParkingSlot.AVAILABLE
        if active_booking:
            if active_booking.status == Booking.STATUS_IN_PROGRESS:
                expected_status = ParkingSlot.OCCUPIED
            else:
                expected_status = ParkingSlot.RESERVED
        
        if ps.status != expected_status and ps.status != ParkingSlot.MAINTENANCE:
            print(f"Updating Parking Slot {ps.slot_number}: {ps.status} -> {expected_status}")
            ps.status = expected_status
            ps.save()

if __name__ == "__main__":
    recalibrate()
