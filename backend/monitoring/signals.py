from django.db.models.signals import post_save
from django.dispatch import receiver
from bookings.models import Booking
from .models import JobCard

@receiver(post_save, sender=Booking)
def create_job_card(sender, instance, created, **kwargs):
    """
    Automatically create a JobCard when a Booking is confirmed.
    """
    if instance.status == Booking.STATUS_CONFIRMED:
        # Check if JobCard already exists to avoid duplicates
        if not hasattr(instance, 'job_card'):
            JobCard.objects.create(
                booking=instance,
                current_stage=JobCard.STAGE_WAITING
            )
