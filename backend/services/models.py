from django.db import models


class VehicleCategory(models.Model):
    """Type of vehicle — determines pricing tier."""
    HATCHBACK = 'hatchback'
    SEDAN = 'sedan'
    SUV = 'suv'
    MUV = 'muv'
    TRUCK = 'truck'
    LUXURY = 'luxury'

    CATEGORY_CHOICES = [
        (HATCHBACK, 'Hatchback'),
        (SEDAN, 'Sedan'),
        (SUV, 'SUV / Crossover'),
        (MUV, 'MUV / Van'),
        (TRUCK, 'Truck / Commercial'),
        (LUXURY, 'Luxury / Premium'),
    ]

    name = models.CharField(max_length=20, choices=CATEGORY_CHOICES, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, help_text='FontAwesome icon class or emoji')

    class Meta:
        verbose_name = 'Vehicle Category'
        verbose_name_plural = 'Vehicle Categories'

    def __str__(self):
        return self.get_name_display()


class ServiceCategory(models.Model):
    """Top-level service category (Wash, Ceramic, Detailing, etc.)"""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = 'Service Category'
        verbose_name_plural = 'Service Categories'
        ordering = ['order']

    def __str__(self):
        return self.name


class CarWashService(models.Model):
    """Individual car wash service package."""
    BASIC = 'basic'
    PREMIUM = 'premium'
    DELUXE = 'deluxe'
    INTERIOR = 'interior'
    FULL = 'full'

    WASH_TYPE_CHOICES = [
        (BASIC, 'Basic Exterior Wash'),
        (PREMIUM, 'Premium Wash'),
        (DELUXE, 'Deluxe Wash'),
        (INTERIOR, 'Interior Cleaning'),
        (FULL, 'Full Service (Exterior + Interior)'),
    ]

    category = models.ForeignKey(ServiceCategory, on_delete=models.CASCADE, related_name='wash_services')
    name = models.CharField(max_length=150)
    wash_type = models.CharField(max_length=20, choices=WASH_TYPE_CHOICES)
    description = models.TextField()
    includes = models.JSONField(default=list, help_text='List of included steps')
    image = models.ImageField(upload_to='services/', null=True, blank=True)
    estimated_duration_minutes = models.PositiveIntegerField(default=30)
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['wash_type']

    def __str__(self):
        return self.name


class CeramicCoatingType(models.Model):
    """Ceramic coating package — duration-based protection."""
    ONE_YEAR = '1yr'
    THREE_YEAR = '3yr'
    FIVE_YEAR = '5yr'
    PPF = 'ppf'
    NANO = 'nano'

    COATING_DURATION_CHOICES = [
        (ONE_YEAR, '1 Year Protection'),
        (THREE_YEAR, '3 Year Protection'),
        (FIVE_YEAR, '5 Year Protection'),
        (PPF, 'Paint Protection Film (PPF)'),
        (NANO, 'Nano Coating'),
    ]

    category = models.ForeignKey(ServiceCategory, on_delete=models.CASCADE, related_name='ceramic_coatings')
    name = models.CharField(max_length=150)
    coating_type = models.CharField(max_length=10, choices=COATING_DURATION_CHOICES)
    description = models.TextField()
    includes = models.JSONField(default=list, help_text='List of application steps / what is included')
    image = models.ImageField(upload_to='services/', null=True, blank=True)
    warranty_months = models.PositiveIntegerField(default=12)
    gloss_level = models.PositiveIntegerField(default=9, help_text='1-10 gloss rating')
    layers = models.PositiveIntegerField(default=2)
    estimated_duration_hours = models.DecimalField(max_digits=4, decimal_places=1, default=4.0)
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['coating_type']

    def __str__(self):
        return self.name


class ServicePricing(models.Model):
    """Price matrix: service x vehicle category."""
    car_wash = models.ForeignKey(
        CarWashService, on_delete=models.CASCADE,
        null=True, blank=True, related_name='pricing'
    )
    ceramic_coating = models.ForeignKey(
        CeramicCoatingType, on_delete=models.CASCADE,
        null=True, blank=True, related_name='pricing'
    )
    vehicle_category = models.ForeignKey(VehicleCategory, on_delete=models.CASCADE, related_name='pricing')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discounted_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = [
            ('car_wash', 'vehicle_category'),
            ('ceramic_coating', 'vehicle_category'),
        ]

    def __str__(self):
        service = self.car_wash or self.ceramic_coating
        return f"{service} - {self.vehicle_category} : ₹{self.price}"

    @property
    def effective_price(self):
        return self.discounted_price if self.discounted_price else self.price
