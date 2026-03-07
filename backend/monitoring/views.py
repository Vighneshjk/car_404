from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Sum, Count, Q
from .models import JobCard, JobStageLog, WorkLog
from .serializers import (
    JobCardSerializer, JobCardListSerializer,
    StageUpdateSerializer, DashboardSerializer,
    CustomerJobListSerializer
)
from bookings.models import Booking, ParkingSlot
from vehicles.models import Vehicle


class IsAdminOrStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'staff']


class JobCardListView(generics.ListAPIView):
    """Staff/admin: list all job cards."""
    serializer_class = JobCardListSerializer
    permission_classes = [IsAdminOrStaff]

    def get_queryset(self):
        user = self.request.user
        qs = JobCard.objects.select_related(
            'booking__customer', 'booking__vehicle', 'booking__time_slot'
        ).prefetch_related('assigned_staff', 'stage_logs', 'work_logs')

        # Staff see their assigned jobs; admin sees all
        if user.role == 'staff':
            qs = qs.filter(assigned_staff=user)

        stage = self.request.query_params.get('stage')
        if stage:
            qs = qs.filter(current_stage=stage)

        date = self.request.query_params.get('date')
        if date:
            qs = qs.filter(booking__time_slot__date=date)

        return qs.order_by('-booking__time_slot__date', 'is_rush')


class JobCardDetailView(generics.RetrieveAPIView):
    """Full job card details."""
    serializer_class = JobCardSerializer
    permission_classes = [IsAdminOrStaff]

    def get_queryset(self):
        return JobCard.objects.select_related(
            'booking__customer', 'booking__vehicle__category',
            'booking__time_slot', 'booking__parking_slot'
        ).prefetch_related(
            'assigned_staff', 'stage_logs__started_by', 'work_logs__staff',
            'booking__car_wash_services', 'booking__ceramic_coatings'
        )


class StageUpdateView(APIView):
    """Staff: update the current stage of a job."""
    permission_classes = [IsAdminOrStaff]

    def patch(self, request, pk):
        try:
            job = JobCard.objects.get(pk=pk)
        except JobCard.DoesNotExist:
            return Response({'error': 'Job not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = StageUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        new_stage = serializer.validated_data['stage']
        notes = serializer.validated_data.get('notes', '')
        photo = serializer.validated_data.get('photo')

        old_stage = job.current_stage

        # Create stage log entry
        stage_log = JobStageLog.objects.create(
            job=job,
            stage=new_stage,
            started_by=request.user,
            notes=notes,
        )
        if photo:
            stage_log.photo = photo
            stage_log.save()

        # Update job card
        job.current_stage = new_stage
        if new_stage == JobCard.STAGE_PREP and not job.started_at:
            job.started_at = timezone.now()
        elif new_stage == JobCard.STAGE_DONE:
            job.completed_at = timezone.now()
            # Update booking status
            booking = job.booking
            booking.status = Booking.STATUS_COMPLETED
            booking.completed_at = timezone.now()
            booking.save()
            # Release parking slot
            if booking.parking_slot:
                booking.parking_slot.status = ParkingSlot.AVAILABLE
                booking.parking_slot.save()

        job.save()

        # Work log audit
        WorkLog.objects.create(
            job=job,
            staff=request.user,
            action='stage_update',
            description=f'Stage changed from {old_stage} to {new_stage}. {notes}',
        )

        return Response({
            'message': f'Job stage updated to {job.get_current_stage_display()}.',
            'current_stage': job.current_stage,
            'current_stage_display': job.get_current_stage_display(),
        })


class DashboardView(APIView):
    """Admin: real-time operational dashboard."""
    permission_classes = [IsAdminOrStaff]

    def get(self, request):
        today = timezone.now().date()
        this_month_start = today.replace(day=1)

        bookings_today = Booking.objects.filter(time_slot__date=today)
        confirmed_today = bookings_today.filter(status=Booking.STATUS_CONFIRMED)
        in_progress = JobCard.objects.filter(
            current_stage__in=[
                JobCard.STAGE_PREP, JobCard.STAGE_WASH,
                JobCard.STAGE_COATING, JobCard.STAGE_DRYING,
                JobCard.STAGE_DETAILING, JobCard.STAGE_QC
            ]
        ).count()
        completed_today = JobCard.objects.filter(
            current_stage=JobCard.STAGE_DONE,
            completed_at__date=today
        ).count()

        available_parking = ParkingSlot.objects.filter(status='available', is_active=True).count()

        revenue_today = bookings_today.filter(
            status=Booking.STATUS_COMPLETED,
            payment_status='paid'
        ).aggregate(total=Sum('final_amount'))['total'] or 0

        revenue_month = Booking.objects.filter(
            time_slot__date__gte=this_month_start,
            status=Booking.STATUS_COMPLETED,
            payment_status='paid'
        ).aggregate(total=Sum('final_amount'))['total'] or 0

        data = {
            'total_bookings_today': bookings_today.count(),
            'confirmed_bookings_today': confirmed_today.count(),
            'jobs_in_progress': in_progress,
            'jobs_completed_today': completed_today,
            'available_parking_slots': available_parking,
            'total_revenue_today': revenue_today,
            'total_revenue_month': revenue_month,
        }

        serializer = DashboardSerializer(data)
        return Response(serializer.data)


class CustomerJobStatusView(APIView):
    """Customer: track their own booking/job status."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, booking_id):
        try:
            booking = Booking.objects.select_related('job_card').get(
                booking_id=booking_id, customer=request.user
            )
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found.'}, status=status.HTTP_404_NOT_FOUND)

        response_data = {
            'booking_id': booking.booking_id,
            'booking_status': booking.get_status_display(),
            'vehicle': f"{booking.vehicle.make} {booking.vehicle.model}",
            'time_slot': str(booking.time_slot),
        }

        if hasattr(booking, 'job_card'):
            job = booking.job_card
            response_data.update({
                'job_stage': job.current_stage,
                'job_stage_display': job.get_current_stage_display(),
                'bay_number': job.bay_number,
                'started_at': job.started_at,
                'estimated_completion': job.estimated_completion,
                'completed_at': job.completed_at,
            })
        else:
            response_data['job_stage'] = 'not_started'

        return Response(response_data)

class CustomerJobListView(generics.ListAPIView):
    """Customer: list their own active jobs."""
    serializer_class = CustomerJobListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return JobCard.objects.filter(
            booking__customer=self.request.user,
            current_stage__in=[
                JobCard.STAGE_WAITING, JobCard.STAGE_PREP, JobCard.STAGE_WASH,
                JobCard.STAGE_COATING, JobCard.STAGE_DRYING,
                JobCard.STAGE_DETAILING, JobCard.STAGE_QC
            ]
        ).select_related('booking__vehicle')


class CustomerDashboardStatsView(APIView):
    """Customer: get summary stats for their dashboard."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        total_jobs = JobCard.objects.filter(booking__customer=user, current_stage=JobCard.STAGE_DONE).count()
        active_jobs = JobCard.objects.filter(
            booking__customer=user
        ).exclude(current_stage=JobCard.STAGE_DONE).count()
        
        vehicle_count = Vehicle.objects.filter(owner=user).count()

        return Response({
            'total_jobs': total_jobs,
            'active_jobs': active_jobs,
            'vehicle_count': vehicle_count,
            'rewards': 'Elite' # placeholder
        })
