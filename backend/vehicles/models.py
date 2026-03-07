from django.db import models
from django.conf import settings
from services.models import VehicleCategory


class Vehicle(models.Model):
    """A customer's registered vehicle."""
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='vehicles'
    )
    category = models.ForeignKey(VehicleCategory, on_delete=models.PROTECT, related_name='vehicles')
    registration_number = models.CharField(max_length=20, unique=True, help_text='e.g. KA01AB1234')
    make = models.CharField(max_length=100, help_text='e.g. Maruti, Toyota')
    model = models.CharField(max_length=100, help_text='e.g. Swift, Innova')
    year = models.PositiveIntegerField()
    color = models.CharField(max_length=50)
    fuel_type = models.CharField(
        max_length=20,
        choices=[
            ('petrol', 'Petrol'),
            ('diesel', 'Diesel'),
            ('electric', 'Electric'),
            ('cng', 'CNG'),
            ('hybrid', 'Hybrid'),
        ],
        default='petrol'
    )
    image = models.ImageField(upload_to='vehicles/', null=True, blank=True)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.registration_number} — {self.make} {self.model} ({self.year})"
