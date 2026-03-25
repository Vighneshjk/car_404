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
import razorpay
from django.conf import settings
import hmac
import hashlib


class IsAdminOrStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'staff']




class TimeSlotListView(generics.ListAPIView):
    """Public: list all available time slots, filterable by date."""
    serializer_class = TimeSlotSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['date']

    def get_queryset(self):
        now = timezone.localtime(timezone.now())
        today = now.date()
        
        date_param = self.request.query_params.get('date')
        if date_param:
            import datetime
            try:
                query_date = datetime.datetime.strptime(date_param, '%Y-%m-%d').date()
                if query_date >= today:
                    if not TimeSlot.objects.filter(date=query_date).exists():
                        slots_to_create = [
                            TimeSlot(date=query_date, start_time=datetime.time(10, 0), end_time=datetime.time(12, 0)),
                            TimeSlot(date=query_date, start_time=datetime.time(13, 0), end_time=datetime.time(15, 0)),
                            TimeSlot(date=query_date, start_time=datetime.time(16, 0), end_time=datetime.time(18, 0)),
                        ]
                        TimeSlot.objects.bulk_create(slots_to_create)
            except ValueError:
                pass

        # Initial filter for active and future dates
        qs = TimeSlot.objects.filter(is_active=True, date__gte=today)
        
        # We need to filter further for today's slots to ensure they haven't passed
        valid_ids = []
        for ts in qs:
            if ts.is_available:
                valid_ids.append(ts.id)
        
        return TimeSlot.objects.filter(id__in=valid_ids).order_by('date', 'start_time')


class TimeSlotManageView(generics.ListCreateAPIView):
    """Admin: manage time slots (create batch slots)."""
    serializer_class = TimeSlotSerializer
    permission_classes = [IsAdminOrStaff]
    queryset = TimeSlot.objects.all().order_by('date', 'start_time')




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

        if old_status != new_status:
            # Updating the status property will trigger the post_save signal
            # which correctly recalculates slot counts and parking statuses.
            pass

        if new_status == Booking.STATUS_CONFIRMED and not booking.confirmed_at:
            booking.confirmed_at = timezone.now()
        elif new_status == Booking.STATUS_COMPLETED and not booking.completed_at:
            booking.completed_at = timezone.now()
        
        # Note: We don't need to manually update parking_slot status here
        # because the signal will catch instance.status and update it.

        if notes:
            booking.internal_notes = notes
        booking.save()

        return Response({
            'message': f'Booking #{booking.booking_id} status updated from {old_status} to {new_status}.',
            'booking_id': booking.booking_id,
            'status': booking.status
        })


class RazorpayOrderView(APIView):
    """Create a Razorpay order for a booking."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            booking = Booking.objects.get(pk=pk, customer=request.user)
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found.'}, status=status.HTTP_404_NOT_FOUND)

        if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
            return Response({'error': 'Razorpay keys not configured.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        
        # Razorpay expects amount in paise (1 INR = 100 paise)
        amount = int(booking.final_amount * 100)
        
        order_data = {
            'amount': amount,
            'currency': 'INR',
            'receipt': f'rcpt_{booking.booking_id}',
            'payment_capture': 1  # Auto capture
        }
        
        try:
            order = client.order.create(data=order_data)
            booking.razorpay_order_id = order['id']
            booking.save()
            return Response({
                'order_id': order['id'],
                'amount': amount,
                'key_id': settings.RAZORPAY_KEY_ID,
                'currency': 'INR',
                'company_name': settings.COMPANY_NAME,
                'customer_name': request.user.full_name,
                'customer_email': request.user.email,
                'customer_phone': request.user.phone
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class RazorpayCallbackView(APIView):
    """Verify Razorpay payment signature and update booking status."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        order_id = request.data.get('razorpay_order_id')
        payment_id = request.data.get('razorpay_payment_id')
        signature = request.data.get('razorpay_signature')

        if not all([order_id, payment_id, signature]):
            return Response({'error': 'Missing payment details.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            booking = Booking.objects.get(razorpay_order_id=order_id)
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Verify signature
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        
        params_dict = {
            'razorpay_order_id': order_id,
            'razorpay_payment_id': payment_id,
            'razorpay_signature': signature
        }

        try:
            client.utility.verify_payment_signature(params_dict)
            booking.razorpay_payment_id = payment_id
            booking.razorpay_signature = signature
            booking.payment_status = Booking.PAYMENT_PAID
            booking.save()
            return Response({'message': 'Payment verified successfully.'})
        except Exception:
            return Response({'error': 'Payment verification failed.'}, status=status.HTTP_400_BAD_REQUEST)
