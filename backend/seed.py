"""
Seed script for 404 Car Care initial data.
Run: python seed.py (from the backend directory)
"""
import os
import sys
import django

os.chdir(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from services.models import (
    VehicleCategory, ServiceCategory, CarWashService,
    CeramicCoatingType, ServicePricing
)
from airports.models import Airport, FacilityLocation
from bookings.models import TimeSlot, ParkingZone, ParkingSlot
from datetime import date, time, timedelta

User = get_user_model()

print("🚗 Seeding 404 Car Care database...\n")

if not User.objects.filter(email='admin@404carcare.com').exists():
    User.objects.create_superuser(
        email='admin@404carcare.com',
        password='Admin@404',
        full_name='Super Admin',
    )
    print("✅ Superuser created: admin@404carcare.com / Admin@404")
else:
    print("⏩ Superuser already exists.")

vehicle_cats = [
    ('hatchback', 'Small hatchback cars', '🚗'),
    ('sedan', 'Mid-size sedans', '🚘'),
    ('suv', 'SUVs and crossovers', '🚙'),
    ('muv', 'MUVs and vans', '🚐'),
    ('truck', 'Trucks and commercial vehicles', '🚛'),
    ('luxury', 'Luxury and premium vehicles', '🏎️'),
]
for name, desc, icon in vehicle_cats:
    VehicleCategory.objects.get_or_create(name=name, defaults={'description': desc, 'icon': icon})
print("✅ Vehicle categories seeded.")

# ─── Service Categories ───────────────────────────────────────────────────────
wash_cat, _ = ServiceCategory.objects.get_or_create(
    slug='car-wash',
    defaults={'name': 'Car Wash', 'description': 'Professional exterior and interior wash packages', 'icon': '🫧', 'order': 1}
)
ceramic_cat, _ = ServiceCategory.objects.get_or_create(
    slug='ceramic-coating',
    defaults={'name': 'Ceramic Coating', 'description': 'Long-lasting paint protection with ceramic coatings', 'icon': '✨', 'order': 2}
)
print("✅ Service categories seeded.")

# ─── Car Wash Services ────────────────────────────────────────────────────────
wash_services = [
    {
        'name': 'Basic Exterior Wash',
        'wash_type': 'basic',
        'description': 'Quick rinse and soap wash for your car exterior.',
        'includes': ['Exterior rinse', 'Foam wash', 'Hand dry', 'Tire cleaning'],
        'estimated_duration_minutes': 20,
    },
    {
        'name': 'Premium Wash',
        'wash_type': 'premium',
        'description': 'Thorough wash with wax coat for added shine.',
        'includes': ['All Basic items', 'Wax application', 'Glass cleaning', 'Wheel polish'],
        'estimated_duration_minutes': 40,
        'is_featured': True,
    },
    {
        'name': 'Deluxe Wash',
        'wash_type': 'deluxe',
        'description': 'Complete exterior wash with polish and sealant.',
        'includes': ['All Premium items', 'Clay bar treatment', 'Paint sealant', 'Tire dressing'],
        'estimated_duration_minutes': 60,
    },
    {
        'name': 'Interior Deep Clean',
        'wash_type': 'interior',
        'description': 'Full interior vacuum, wipe-down and sanitization.',
        'includes': ['Vacuum all surfaces', 'Dashboard wipe', 'Seat cleaning', 'Air vent cleaning', 'Floor mat wash'],
        'estimated_duration_minutes': 45,
    },
    {
        'name': 'Full Service Package',
        'wash_type': 'full',
        'description': 'Complete exterior + interior service for a showroom finish.',
        'includes': ['All Deluxe exterior items', 'All Interior items', 'Odor treatment', 'Free touch-up'],
        'estimated_duration_minutes': 90,
        'is_featured': True,
    },
]
wash_objs = {}
for s in wash_services:
    featured = s.pop('is_featured', False)
    obj, created = CarWashService.objects.get_or_create(
        name=s['name'], defaults={**s, 'category': wash_cat, 'is_featured': featured}
    )
    wash_objs[obj.wash_type] = obj
print("✅ Car wash services seeded.")

# ─── Ceramic Coating Types ────────────────────────────────────────────────────
coatings = [
    {
        'name': 'Nano Ceramic Coat',
        'coating_type': 'nano',
        'description': 'Entry-level nano ceramic protection for everyday cars.',
        'includes': ['Surface prep', '1 layer nano coat', 'Gloss enhancement'],
        'warranty_months': 6, 'gloss_level': 8, 'layers': 1,
        'estimated_duration_hours': 3.0,
    },
    {
        'name': '1-Year Ceramic Shield',
        'coating_type': '1yr',
        'description': '1-year certified protection against UV, dirt and minor scratches.',
        'includes': ['Paint decontamination', 'Polish prep', '2 layer coat', 'UV protection'],
        'warranty_months': 12, 'gloss_level': 9, 'layers': 2,
        'estimated_duration_hours': 5.0, 'is_featured': True,
    },
    {
        'name': '3-Year Diamond Coat',
        'coating_type': '3yr',
        'description': 'Superior 3-year protection with hydrophobic properties.',
        'includes': ['Full decontamination', 'Machine polish', '3 layer diamond coat', 'Certification'],
        'warranty_months': 36, 'gloss_level': 9, 'layers': 3,
        'estimated_duration_hours': 8.0, 'is_featured': True,
    },
    {
        'name': '5-Year Titanium Coat',
        'coating_type': '5yr',
        'description': 'Premium 5-year titanium ceramic for maximum paint life.',
        'includes': ['Full correction', '4 layer titanium coat', 'Windshield coat', '5-year warranty card'],
        'warranty_months': 60, 'gloss_level': 10, 'layers': 4,
        'estimated_duration_hours': 12.0,
    },
    {
        'name': 'PPF (Paint Protection Film)',
        'coating_type': 'ppf',
        'description': 'Physical film protection against rock chips and scratches.',
        'includes': ['Surface prep', 'Full front PPF', 'Hood coverage', 'Bumper coverage'],
        'warranty_months': 84, 'gloss_level': 9, 'layers': 1,
        'estimated_duration_hours': 16.0,
    },
]
coating_objs = {}
for c in coatings:
    featured = c.pop('is_featured', False)
    obj, created = CeramicCoatingType.objects.get_or_create(
        name=c['name'], defaults={**c, 'category': ceramic_cat, 'is_featured': featured}
    )
    coating_objs[obj.coating_type] = obj
print("✅ Ceramic coating types seeded.")

# ─── Pricing ──────────────────────────────────────────────────────────────────
wash_prices = {
    'basic': {'hatchback': 299, 'sedan': 349, 'suv': 449, 'muv': 499, 'truck': 699, 'luxury': 599},
    'premium': {'hatchback': 599, 'sedan': 699, 'suv': 899, 'muv': 999, 'truck': 1299, 'luxury': 1199},
    'deluxe': {'hatchback': 899, 'sedan': 999, 'suv': 1299, 'muv': 1499, 'truck': 1999, 'luxury': 1799},
    'interior': {'hatchback': 699, 'sedan': 799, 'suv': 999, 'muv': 1199, 'truck': 1499, 'luxury': 1299},
    'full': {'hatchback': 1299, 'sedan': 1499, 'suv': 1999, 'muv': 2299, 'truck': 2999, 'luxury': 2799},
}
ceramic_prices = {
    'nano': {'hatchback': 3999, 'sedan': 4999, 'suv': 6999, 'muv': 7999, 'truck': 9999, 'luxury': 8999},
    '1yr': {'hatchback': 7999, 'sedan': 9999, 'suv': 13999, 'muv': 15999, 'truck': 19999, 'luxury': 17999},
    '3yr': {'hatchback': 14999, 'sedan': 18999, 'suv': 24999, 'muv': 28999, 'truck': 34999, 'luxury': 32999},
    '5yr': {'hatchback': 24999, 'sedan': 29999, 'suv': 39999, 'muv': 44999, 'truck': 54999, 'luxury': 49999},
    'ppf': {'hatchback': 34999, 'sedan': 44999, 'suv': 59999, 'muv': 69999, 'truck': 84999, 'luxury': 79999},
}

all_cats = {vc.name: vc for vc in VehicleCategory.objects.all()}
for wash_type, prices in wash_prices.items():
    service = wash_objs.get(wash_type)
    if service:
        for cat_name, price in prices.items():
            vc = all_cats.get(cat_name)
            if vc:
                ServicePricing.objects.get_or_create(
                    car_wash=service, vehicle_category=vc,
                    defaults={'price': price}
                )

for coating_type, prices in ceramic_prices.items():
    coating = coating_objs.get(coating_type)
    if coating:
        for cat_name, price in prices.items():
            vc = all_cats.get(cat_name)
            if vc:
                ServicePricing.objects.get_or_create(
                    ceramic_coating=coating, vehicle_category=vc,
                    defaults={'price': price}
                )
print("✅ Pricing seeded.")

# ─── Airports ─────────────────────────────────────────────────────────────────
airports_data = [
    {'name': 'Kempegowda International Airport', 'code': 'BLR', 'city': 'Bengaluru', 'distance_km': 2.5, 'drive_minutes': 8},
    {'name': 'Rajiv Gandhi International Airport', 'code': 'HYD', 'city': 'Hyderabad', 'distance_km': 15.0, 'drive_minutes': 25},
    {'name': 'Chennai International Airport', 'code': 'MAA', 'city': 'Chennai', 'distance_km': 5.0, 'drive_minutes': 12},
]
for a in airports_data:
    Airport.objects.get_or_create(code=a['code'], defaults=a)
print("✅ Airports seeded.")

# ─── Facility Location ─────────────────────────────────────────────────────────
if not FacilityLocation.objects.exists():
    FacilityLocation.objects.create(
        name='404 Car Care',
        address_line1='Plot No. 404, Airport Road',
        address_line2='Near Terminal 2',
        city='Bengaluru',
        state='Karnataka',
        pincode='560300',
        latitude=13.1986,
        longitude=77.7066,
        google_maps_url='https://maps.google.com',
        phone='+91-9999999999',
        email='info@404carcare.com',
        working_hours={
            'monday': '6:00 AM - 10:00 PM',
            'tuesday': '6:00 AM - 10:00 PM',
            'wednesday': '6:00 AM - 10:00 PM',
            'thursday': '6:00 AM - 10:00 PM',
            'friday': '6:00 AM - 10:00 PM',
            'saturday': '6:00 AM - 11:00 PM',
            'sunday': '7:00 AM - 9:00 PM',
        }
    )
print("✅ Facility location seeded.")

# ─── Parking ──────────────────────────────────────────────────────────────────
zone_a, _ = ParkingZone.objects.get_or_create(
    name='Zone A', defaults={'description': 'Covered premium zone', 'total_slots': 10, 'is_covered': True}
)
zone_b, _ = ParkingZone.objects.get_or_create(
    name='Zone B', defaults={'description': 'Open air zone', 'total_slots': 20, 'is_covered': False}
)
zone_c, _ = ParkingZone.objects.get_or_create(
    name='Zone C', defaults={'description': 'Service bay zone', 'total_slots': 6, 'is_covered': True}
)

for i in range(1, 11):
    ParkingSlot.objects.get_or_create(zone=zone_a, slot_number=f'A{i}')
for i in range(1, 21):
    ParkingSlot.objects.get_or_create(zone=zone_b, slot_number=f'B{i}')
for i in range(1, 7):
    ParkingSlot.objects.get_or_create(zone=zone_c, slot_number=f'C{i}')
print("✅ Parking zones and slots seeded.")

# ─── Time Slots (next 7 days) ─────────────────────────────────────────────────
slot_times = [
    (time(6, 0), time(7, 0)),
    (time(7, 0), time(8, 0)),
    (time(8, 0), time(9, 0)),
    (time(9, 0), time(10, 0)),
    (time(10, 0), time(11, 0)),
    (time(11, 0), time(12, 0)),
    (time(12, 0), time(13, 0)),
    (time(13, 0), time(14, 0)),
    (time(14, 0), time(15, 0)),
    (time(15, 0), time(16, 0)),
    (time(16, 0), time(17, 0)),
    (time(17, 0), time(18, 0)),
    (time(18, 0), time(19, 0)),
    (time(19, 0), time(20, 0)),
    (time(20, 0), time(21, 0)),
    (time(21, 0), time(22, 0)),
]

today = date.today()
for day_offset in range(14):  # Next 14 days
    slot_date = today + timedelta(days=day_offset)
    for start, end in slot_times:
        TimeSlot.objects.get_or_create(
            date=slot_date, start_time=start, end_time=end,
            defaults={'capacity': 5}
        )
print("✅ Time slots seeded for next 14 days.")

print("\n🎉 Database seeding complete!")
print("\n📋 Admin login: admin@404carcare.com / Admin@404")
print("🌐 API base URL: http://127.0.0.1:8000/api/")
