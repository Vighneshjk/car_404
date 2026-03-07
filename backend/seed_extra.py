
import os
import sys
import django
import random
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from vehicles.models import Vehicle
from bookings.models import Booking, TimeSlot, ParkingSlot
from services.models import CarWashService, CeramicCoatingType, VehicleCategory
from monitoring.models import JobCard

User = get_user_model()

def seed_extra_data():
    print("🌱 Seeding more data for testing...")
    
    # 1. Ensure test user exists
    user, _ = User.objects.get_or_create(
        email='test@gmail.com',
        defaults={
            'full_name': 'Test User',
            'phone': '9876543210'
        }
    )
    if _:
        user.set_password('Password123!')
        user.save()
        print(f"✅ User test@gmail.com created.")

    # 2. Add some vehicles for test user
    categories = list(VehicleCategory.objects.all())
    if not categories:
        print("❌ No vehicle categories found. Run seed.py first.")
        return

    vehicles_data = [
        ('KA05MT1234', 'BMW', 'X5', 'suv'),
        ('MH01AB9999', 'Tesla', 'Model S', 'luxury'),
        ('DL03CK5555', 'Honda', 'City', 'sedan'),
    ]
    
    for plate, make, model, cat_name in vehicles_data:
        cat = next((c for c in categories if c.name == cat_name), categories[0])
        Vehicle.objects.get_or_create(
            registration_number=plate,
            defaults={
                'owner': user,
                'make': make,
                'model': model,
                'year': 2023,
                'category': cat,
                'color': 'Black',
                'fuel_type': 'petrol'
            }
        )
    print("✅ Test vehicles added.")

    # 3. Create some active bookings and jobs
    my_vehicles = Vehicle.objects.filter(owner=user)
    slots = list(TimeSlot.objects.filter(is_active=True)[:10])
    parking = list(ParkingSlot.objects.filter(status='available')[:10])
    services = list(CarWashService.objects.all())

    if my_vehicles and slots and parking and services:
        for i in range(2):
            v = my_vehicles[i % len(my_vehicles)]
            s = slots[random.randint(0, len(slots)-1)]
            p = parking[i % len(parking)]
            svc = services[random.randint(0, len(services)-1)]
            
            booking, created = Booking.objects.get_or_create(
                customer=user,
                vehicle=v,
                time_slot=s,
                defaults={
                    'parking_slot': p,
                    'status': 'confirmed',
                    'total_amount': 500,
                    'final_amount': 500
                }
            )
            if created:
                booking.car_wash_services.add(svc)
                # Create a JobCard for active jobs display
                JobCard.objects.get_or_create(
                    booking=booking,
                    defaults={
                        'current_stage': 'washing',
                        'bay_number': f'Bay {i+1}',
                        'estimated_completion': datetime.now() + timedelta(hours=1)
                    }
                )
        print("✅ Active bookings and jobs created for test user.")

    print("🚀 Extra data seeding complete!")

if __name__ == "__main__":
    seed_extra_data()
