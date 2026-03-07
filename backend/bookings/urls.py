from django.urls import path
from .views import (
    TimeSlotListView, TimeSlotManageView,
    ParkingZoneListView, ParkingSlotListView,
    BookingListCreateView, BookingDetailView,
    BookingCancelView, MyBookingsView, BookingStatusUpdateView,
)

urlpatterns = [
    # Time slots
    path('time-slots/', TimeSlotListView.as_view(), name='time-slot-list'),
    path('time-slots/manage/', TimeSlotManageView.as_view(), name='time-slot-manage'),

    # Parking
    path('parking/zones/', ParkingZoneListView.as_view(), name='parking-zones'),
    path('parking/slots/', ParkingSlotListView.as_view(), name='parking-slots'),

    # Bookings
    path('', BookingListCreateView.as_view(), name='booking-list-create'),
    path('<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),
    path('<int:pk>/cancel/', BookingCancelView.as_view(), name='booking-cancel'),
    path('<int:pk>/update-status/', BookingStatusUpdateView.as_view(), name='booking-update-status'),
    path('my-bookings/', MyBookingsView.as_view(), name='my-bookings'),
]
