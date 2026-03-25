from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.exceptions import ValidationError


class TimeSlot(models.Model):
    """Available time slots for service bookings."""
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    capacity = models.PositiveIntegerField(default=3, help_text='Max simultaneous bookings')
    booked_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    notes = models.CharField(max_length=200, blank=True)

    class Meta:
        ordering = ['date', 'start_time']
        unique_together = ['date', 'start_time', 'end_time']

    def __str__(self):
        return f"{self.date} | {self.start_time.strftime('%I:%M %p')} - {self.end_time.strftime('%I:%M %p')}"

    @property
    def available_slots(self):
        return max(0, self.capacity - self.booked_count)

    @property
    def is_available(self):
        if not self.is_active or self.available_slots <= 0:
            return False
        
        # Use localized time for correct comparison (respects settings.TIME_ZONE)
        now = timezone.localtime(timezone.now())
        current_date = now.date()
        
        if self.date < current_date:
            return False
        
        if self.date == current_date:
            # If the slot is for today, it must start at least 30 mins from now
            threshold = (now + timezone.timedelta(minutes=30)).time()
            return self.start_time >= threshold
            
        return True

    def clean(self):
        if self.start_time >= self.end_time:
            raise ValidationError('Start time must be before end time.')


class ParkingZone(models.Model):
    """Zones within the parking area."""
    name = models.CharField(max_length=50, unique=True, help_text='e.g. Zone A, Zone B')
    description = models.CharField(max_length=200, blank=True)
    total_slots = models.PositiveIntegerField(default=10)
    is_covered = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class ParkingSlot(models.Model):
    """Individual parking slot within a zone."""
    AVAILABLE = 'available'
    OCCUPIED = 'occupied'
    RESERVED = 'reserved'
    MAINTENANCE = 'maintenance'

    STATUS_CHOICES = [
        (AVAILABLE, 'Available'),
        (OCCUPIED, 'Occupied'),
        (RESERVED, 'Reserved'),
        (MAINTENANCE, 'Under Maintenance'),
    ]

    zone = models.ForeignKey(ParkingZone, on_delete=models.CASCADE, related_name='slots')
    slot_number = models.CharField(max_length=10, help_text='e.g. A1, B3')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default=AVAILABLE)
    is_active = models.BooleanField(default=True)
    notes = models.CharField(max_length=200, blank=True)

    class Meta:
        unique_together = ['zone', 'slot_number']
        ordering = ['zone', 'slot_number']

    def __str__(self):
        return f"{self.zone.name} - Slot {self.slot_number} ({self.get_status_display()})"

    @property
    def is_free(self):
        return self.status == self.AVAILABLE and self.is_active


class Booking(models.Model):
    """A customer's service booking."""
    STATUS_PENDING = 'pending'
    STATUS_CONFIRMED = 'confirmed'
    STATUS_IN_PROGRESS = 'in_progress'
    STATUS_COMPLETED = 'completed'
    STATUS_CANCELLED = 'cancelled'
    STATUS_NO_SHOW = 'no_show'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_CONFIRMED, 'Confirmed'),
        (STATUS_IN_PROGRESS, 'In Progress'),
        (STATUS_COMPLETED, 'Completed'),
        (STATUS_CANCELLED, 'Cancelled'),
        (STATUS_NO_SHOW, 'No Show'),
    ]

    PAYMENT_PENDING = 'pending'
    PAYMENT_PAID = 'paid'
    PAYMENT_REFUNDED = 'refunded'

    PAYMENT_STATUS_CHOICES = [
        (PAYMENT_PENDING, 'Payment Pending'),
        (PAYMENT_PAID, 'Paid'),
        (PAYMENT_REFUNDED, 'Refunded'),
    ]

    booking_id = models.CharField(max_length=20, unique=True, editable=False)
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='bookings'
    )
    vehicle = models.ForeignKey('vehicles.Vehicle', on_delete=models.PROTECT, related_name='bookings')
    time_slot = models.ForeignKey(TimeSlot, on_delete=models.PROTECT, related_name='bookings')
    parking_slot = models.ForeignKey(
        ParkingSlot, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='bookings'
    )


    car_wash_services = models.ManyToManyField(
        'services.CarWashService', blank=True, related_name='bookings'
    )
    ceramic_coatings = models.ManyToManyField(
        'services.CeramicCoatingType', blank=True, related_name='bookings'
    )

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    payment_status = models.CharField(max_length=15, choices=PAYMENT_STATUS_CHOICES, default=PAYMENT_PENDING)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    final_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    special_requests = models.TextField(blank=True)
    internal_notes = models.TextField(blank=True, help_text='Staff-only notes')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Razorpay integration
    razorpay_order_id = models.CharField(max_length=100, null=True, blank=True)
    razorpay_payment_id = models.CharField(max_length=100, null=True, blank=True)
    razorpay_signature = models.CharField(max_length=200, null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Booking #{self.booking_id} — {self.customer.full_name}"

    def save(self, *args, **kwargs):
        if not self.booking_id:
            import uuid
            self.booking_id = f"404-{str(uuid.uuid4()).upper()[:8]}"
        super().save(*args, **kwargs)

    def cancel(self):
        if self.status in [self.STATUS_PENDING, self.STATUS_CONFIRMED]:
            self.status = self.STATUS_CANCELLED
            self.save() # Triggers signal to free resources
            return True
        return False
