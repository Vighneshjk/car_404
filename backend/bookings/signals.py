from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from .models import Booking, ParkingSlot, TimeSlot

@receiver(pre_save, sender=Booking)
def capture_previous_resources(sender, instance, **kwargs):
    """Capture previous time_slot and parking_slot to handle changes."""
    if instance.id:
        try:
            old_instance = Booking.objects.get(id=instance.id)
            instance._old_time_slot_id = old_instance.time_slot_id
            instance._old_parking_slot_id = old_instance.parking_slot_id
        except Booking.DoesNotExist:
            instance._old_time_slot_id = None
            instance._old_parking_slot_id = None
    else:
        instance._old_time_slot_id = None
        instance._old_parking_slot_id = None

@receiver(post_save, sender=Booking)
def update_resources_on_save(sender, instance, created, **kwargs):
    """
    Update TimeSlot.booked_count and ParkingSlot.status when a booking is created or updated.
    """
    # 1. Update current TimeSlot
    _recalibrate_time_slot(instance.time_slot_id)
    
    # 2. Update previous TimeSlot if it changed
    old_ts_id = getattr(instance, '_old_time_slot_id', None)
    if old_ts_id and old_ts_id != instance.time_slot_id:
        _recalibrate_time_slot(old_ts_id)

    # 3. Update current ParkingSlot
    if instance.parking_slot_id:
        _recalibrate_parking_slot(instance.parking_slot_id)
        
    # 4. Update previous ParkingSlot if it changed
    old_ps_id = getattr(instance, '_old_parking_slot_id', None)
    if old_ps_id and old_ps_id != instance.parking_slot_id:
        _recalibrate_parking_slot(old_ps_id)

@receiver(post_delete, sender=Booking)
def update_resources_on_delete(sender, instance, **kwargs):
    """Ensure counts are decreased if a booking is deleted."""
    if instance.time_slot_id:
        _recalibrate_time_slot(instance.time_slot_id)
    if instance.parking_slot_id:
        _recalibrate_parking_slot(instance.parking_slot_id)

def _recalibrate_time_slot(time_slot_id):
    if not time_slot_id: return
    try:
        ts = TimeSlot.objects.get(id=time_slot_id)
        actual_count = Booking.objects.filter(time_slot_id=time_slot_id).exclude(status__in=[Booking.STATUS_CANCELLED, Booking.STATUS_NO_SHOW]).count()
        if ts.booked_count != actual_count:
            ts.booked_count = actual_count
            ts.save(update_fields=['booked_count'])
    except TimeSlot.DoesNotExist:
        pass

def _recalibrate_parking_slot(parking_slot_id):
    if not parking_slot_id: return
    try:
        ps = ParkingSlot.objects.get(id=parking_slot_id)
        if ps.status == ParkingSlot.MAINTENANCE:
            return
            
        active_booking = Booking.objects.filter(
            parking_slot_id=parking_slot_id
        ).exclude(
            status__in=[Booking.STATUS_COMPLETED, Booking.STATUS_CANCELLED, Booking.STATUS_NO_SHOW]
        ).first()
        
        expected_status = ParkingSlot.AVAILABLE
        if active_booking:
            # If the booking is confirmed, it's reserved
            expected_status = ParkingSlot.RESERVED
        
        if ps.status != expected_status:
            ps.status = expected_status
            ps.save(update_fields=['status'])
    except ParkingSlot.DoesNotExist:
        pass
