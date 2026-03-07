from django.db import models


class Airport(models.Model):
    """Nearby airports the business serves."""
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=10, unique=True, help_text='IATA code, e.g. BLR')
    city = models.CharField(max_length=100)
    distance_km = models.DecimalField(max_digits=6, decimal_places=2, help_text='Distance from our facility in km')
    drive_minutes = models.PositiveIntegerField(help_text='Estimated drive time in minutes')
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['distance_km']

    def __str__(self):
        return f"{self.name} ({self.code}) — {self.distance_km} km"


class FacilityLocation(models.Model):
    """The company's physical location details."""
    name = models.CharField(max_length=200, default='404 Car Care')
    address_line1 = models.CharField(max_length=255)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    google_maps_url = models.URLField(blank=True)
    phone = models.CharField(max_length=15)
    email = models.EmailField()
    working_hours = models.JSONField(
        default=dict,
        help_text='e.g. {"monday": "8AM-8PM", "sunday": "Closed"}'
    )
    is_primary = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Facility Location'

    def __str__(self):
        return f"{self.name} — {self.city}"
