import requests
import datetime
import json

BASE_URL = 'http://127.0.0.1:8000/api'
session = requests.Session()

def run_test():
    print("1. Logging in as testuser@example.com (or test@example.com)...")
    login_data = {'email': 'testuser@example.com', 'password': 'password'}
    res = session.post(f"{BASE_URL}/users/login/", json=login_data)
    
    if res.status_code != 200:
        print("Login failed, trying test@example.com")
        login_data = {'email': 'test@example.com', 'password': 'password'}
        res = session.post(f"{BASE_URL}/users/login/", json=login_data)
        if res.status_code != 200:
            print("Failed to login to both test accounts. Response:", res.text)
            return

    token = res.json().get('access')
    headers = {'Authorization': f'Bearer {token}'}
    session.headers.update(headers)
    print("Login successful!")

    print("\n2. Getting vehicles...")
    v_res = session.get(f"{BASE_URL}/vehicles/")
    vehicles = v_res.json().get('results', v_res.json())
    if not vehicles:
        print("No vehicles found. Must create one first.")
        # Create a category if needed, or get one
        c_res = session.get(f"{BASE_URL}/services/vehicle-categories/")
        cats = c_res.json().get('results', c_res.json())
        cat_id = cats[0]['id'] if cats else 1
        
        v_data = {
            "registration_number": "KA01AB1234",
            "make": "Tesla",
            "model": "Model S",
            "category": cat_id,
            "year": 2024,
            "color": "Red",
            "fuel_type": "ev",
            "owner_name": "Test User"
        }
        create_v = session.post(f"{BASE_URL}/vehicles/", json=v_data)
        if create_v.status_code == 201:
            vehicles = [create_v.json()]
            print("Vehicle created!")
        else:
            print("Failed to create vehicle:", create_v.text)
            return

    vehicle_id = vehicles[0]['id']
    print(f"Using vehicle ID: {vehicle_id} (Reg: {vehicles[0]['registration_number']})")

    print("\n3. Testing auto-generation of 3 time slots for tomorrow...")
    tomorrow = datetime.date.today() + datetime.timedelta(days=1)
    t_res = session.get(f"{BASE_URL}/bookings/time-slots/?date={tomorrow}")
    slots = t_res.json().get('results', t_res.json())
    print(f"Found {len(slots)} slots for {tomorrow}:")
    for s in slots:
        print(f" - ID: {s['id']}, Time: {s['start_time']} to {s['end_time']}")

    if len(slots) < 3:
        print("Warning: Expected at least 3 slots, found fewer.")
    slot_id = slots[0]['id']

    print("\n4. Getting a parking slot...")
    p_res = session.get(f"{BASE_URL}/bookings/parking/slots/")
    pslots = p_res.json().get('results', p_res.json())
    park_id = pslots[0]['id'] if pslots else None
    print(f"Using parking slot ID: {park_id}")

    print("\n5. Getting services...")
    s_res = session.get(f"{BASE_URL}/services/car-wash/")
    services = s_res.json().get('results', s_res.json())
    service_id = services[0]['id'] if services else None
    print(f"Using service ID: {service_id}")

    print("\n6. Creating booking...")
    b_data = {
        "vehicle": vehicle_id,
        "time_slot": slot_id,
        "parking_slot": park_id,
        "car_wash_services": [service_id] if service_id else [],
        "ceramic_coatings": []
    }
    b_res = session.post(f"{BASE_URL}/bookings/", json=b_data)
    if b_res.status_code == 201:
        booking = b_res.json()
        print(f"Booking created! ID: {booking['id']}, Status: {booking['status']}")
    else:
        print("Booking failed:", b_res.text)
        return

    print("\n7. Simulating Payment...")
    p_data = {
        "amount": str(booking['final_amount']),
        "currency": "INR",
        "receipt": booking['booking_id']
    }
    pay_res = session.post(f"{BASE_URL}/bookings/{booking['id']}/create-payment/", json=p_data)
    if pay_res.status_code == 200:
        print("Payment intent created successfully:")
        print(pay_res.json())
        print("\nFlow completely successful! ✓")
    else:
        print("Payment initiation failed:", pay_res.text)

if __name__ == '__main__':
    run_test()
