from rest_framework import generics, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone
from .models import TimeSlot, ParkingZone, ParkingSlot, Booking
from .serializers import (
    TimeSlotSerializer, ParkingZoneSerializer, ParkingSlotSerializer,
    BookingCreateSerializer, BookingDetailSerializer, BookingListSerializer
)


class IsAdminOrStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'staff']


# ─── Time Slots ──────────────────────────────────────────────────────────────

class TimeSlotListView(generics.ListAPIView):
    """Public: list all available time slots, filterable by date."""
    serializer_class = TimeSlotSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['date']

    def get_queryset(self):
        today = timezone.now().date()
        return TimeSlot.objects.filter(
            is_active=True, date__gte=today
        ).order_by('date', 'start_time')


class TimeSlotManageView(generics.ListCreateAPIView):
    """Admin: manage time slots (create batch slots)."""
    serializer_class = TimeSlotSerializer
    permission_classes = [IsAdminOrStaff]
    queryset = TimeSlot.objects.all().order_by('date', 'start_time')


# ─── Parking ─────────────────────────────────────────────────────────────────

class ParkingZoneListView(generics.ListAPIView):
    """List all parking zones with available count."""
    serializer_class = ParkingZoneSerializer
    permission_classes = [permissions.AllowAny]
    queryset = ParkingZone.objects.filter(is_active=True).prefetch_related('slots')


class ParkingSlotListView(generics.ListAPIView):
    """List parking slots, filterable by zone and status."""
    serializer_class = ParkingSlotSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['zone', 'status']

    def get_queryset(self):
        return ParkingSlot.objects.filter(is_active=True).select_related('zone')


# ─── Bookings ─────────────────────────────────────────────────────────────────

class BookingListCreateView(generics.ListCreateAPIView):
    """Create a booking or list bookings."""
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'payment_status']
    search_fields = ['booking_id', 'vehicle__registration_number', 'customer__full_name']
    ordering_fields = ['created_at', 'time_slot__date']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BookingCreateSerializer
        return BookingListSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Booking.objects.select_related(
            'customer', 'vehicle', 'time_slot', 'parking_slot'
        ).prefetch_related('car_wash_services', 'ceramic_coatings')

        if user.role in ['admin', 'staff']:
            return qs.all()
        return qs.filter(customer=user)


class BookingDetailView(generics.RetrieveAPIView):
    """Get full details of a specific booking."""
    serializer_class = BookingDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Booking.objects.select_related(
            'customer', 'vehicle__category', 'time_slot', 'parking_slot__zone'
        ).prefetch_related('car_wash_services__pricing', 'ceramic_coatings__pricing')
        if user.role in ['admin', 'staff']:
            return qs.all()
        return qs.filter(customer=user)


class BookingCancelView(APIView):
    """Cancel a pending or confirmed booking."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            user = request.user
            if user.role in ['admin', 'staff']:
                booking = Booking.objects.get(pk=pk)
            else:
                booking = Booking.objects.get(pk=pk, customer=user)
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found.'}, status=status.HTTP_404_NOT_FOUND)

        if booking.cancel():
            return Response({'message': f'Booking #{booking.booking_id} cancelled successfully.'})
        return Response(
            {'error': f'Cannot cancel a booking with status: {booking.get_status_display()}.'},
            status=status.HTTP_400_BAD_REQUEST
        )


class MyBookingsView(generics.ListAPIView):
    """List only the authenticated customer's bookings."""
    serializer_class = BookingListSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['status']
    ordering = ['-created_at']

    def get_queryset(self):
        return Booking.objects.filter(
            customer=self.request.user
        ).select_related('vehicle', 'time_slot', 'parking_slot').prefetch_related(
            'car_wash_services', 'ceramic_coatings'
        )


class BookingStatusUpdateView(APIView):
    """Staff/admin: update a booking's status."""
    permission_classes = [IsAdminOrStaff]

    def patch(self, request, pk):
        try:
            booking = Booking.objects.get(pk=pk)
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found.'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        valid_statuses = [s[0] for s in Booking.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response({'error': f'Invalid status. Choose from: {valid_statuses}'}, status=status.HTTP_400_BAD_REQUEST)

        notes = request.data.get('internal_notes', '')
        old_status = booking.status
        booking.status = new_status

        if new_status == Booking.STATUS_CONFIRMED and not booking.confirmed_at:
            booking.confirmed_at = timezone.now()
        elif new_status == Booking.STATUS_COMPLETED and not booking.completed_at:
            booking.completed_at = timezone.now()

        if notes:
            booking.internal_notes = notes
        booking.save()

        return Response({
            'message': f'Booking #{booking.booking_id} status updated from {old_status} to {new_status}.',
            'booking_id': booking.booking_id,
            'status': booking.status
        })
