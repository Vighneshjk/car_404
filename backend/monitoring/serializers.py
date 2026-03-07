from rest_framework import serializers
from .models import JobCard, JobStageLog, WorkLog
from accounts.serializers import UserSerializer


class WorkLogSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source='staff.full_name', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)

    class Meta:
        model = WorkLog
        fields = ['id', 'staff_name', 'action', 'action_display', 'description', 'timestamp']


class JobStageLogSerializer(serializers.ModelSerializer):
    stage_display = serializers.CharField(source='get_stage_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    started_by_name = serializers.CharField(source='started_by.full_name', read_only=True)

    class Meta:
        model = JobStageLog
        fields = [
            'id', 'stage', 'stage_display', 'status', 'status_display',
            'started_by_name', 'started_at', 'completed_at', 'notes', 'photo'
        ]


class JobCardSerializer(serializers.ModelSerializer):
    booking_id = serializers.CharField(source='booking.booking_id', read_only=True)
    customer_name = serializers.CharField(source='booking.customer.full_name', read_only=True)
    vehicle_reg = serializers.CharField(source='booking.vehicle.registration_number', read_only=True)
    vehicle_make_model = serializers.SerializerMethodField()
    current_stage_display = serializers.CharField(source='get_current_stage_display', read_only=True)
    stage_logs = JobStageLogSerializer(many=True, read_only=True)
    work_logs = WorkLogSerializer(many=True, read_only=True)
    assigned_staff_names = serializers.SerializerMethodField()
    date = serializers.DateField(source='booking.time_slot.date', read_only=True)
    time_slot = serializers.SerializerMethodField()

    class Meta:
        model = JobCard
        fields = [
            'id', 'booking_id', 'customer_name', 'vehicle_reg', 'vehicle_make_model',
            'current_stage', 'current_stage_display',
            'assigned_staff_names', 'bay_number', 'is_rush',
            'started_at', 'completed_at', 'estimated_completion',
            'technician_notes', 'before_photo', 'after_photo',
            'stage_logs', 'work_logs', 'date', 'time_slot',
            'created_at', 'updated_at'
        ]

    def get_vehicle_make_model(self, obj):
        v = obj.booking.vehicle
        return f"{v.make} {v.model} ({v.year})"

    def get_assigned_staff_names(self, obj):
        return [s.full_name for s in obj.assigned_staff.all()]

    def get_time_slot(self, obj):
        ts = obj.booking.time_slot
        return f"{ts.start_time.strftime('%I:%M %p')} - {ts.end_time.strftime('%I:%M %p')}"


class JobCardListSerializer(serializers.ModelSerializer):
    """Compact job card for list views."""
    booking_id = serializers.CharField(source='booking.booking_id', read_only=True)
    customer_name = serializers.CharField(source='booking.customer.full_name', read_only=True)
    vehicle_reg = serializers.CharField(source='booking.vehicle.registration_number', read_only=True)
    current_stage_display = serializers.CharField(source='get_current_stage_display', read_only=True)
    date = serializers.DateField(source='booking.time_slot.date', read_only=True)

    class Meta:
        model = JobCard
        fields = [
            'id', 'booking_id', 'customer_name', 'vehicle_reg',
            'current_stage', 'current_stage_display', 'bay_number',
            'is_rush', 'date', 'started_at', 'completed_at'
        ]


class StageUpdateSerializer(serializers.Serializer):
    stage = serializers.ChoiceField(choices=JobCard.JOB_STATUS_CHOICES)
    notes = serializers.CharField(required=False, allow_blank=True)
    photo = serializers.ImageField(required=False)


class DashboardSerializer(serializers.Serializer):
    """Aggregated dashboard stats."""
    total_bookings_today = serializers.IntegerField()
    confirmed_bookings_today = serializers.IntegerField()
    jobs_in_progress = serializers.IntegerField()
    jobs_completed_today = serializers.IntegerField()
    available_parking_slots = serializers.IntegerField()
    total_revenue_today = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_revenue_month = serializers.DecimalField(max_digits=12, decimal_places=2)

class CustomerJobListSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_current_stage_display', read_only=True)
    vehicle_details = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField() # For numeric progress if needed

    class Meta:
        model = JobCard
        fields = [
            'id', 'status_display', 'vehicle_details', 'status', 
            'created_at', 'estimated_completion', 'bay_number'
        ]

    def get_vehicle_details(self, obj):
        v = obj.booking.vehicle
        return {
            'plate_number': v.registration_number,
            'make': v.make,
            'model': v.model
        }

    def get_status(self, obj):
        # Convert stage to index for progress bar
        stages = [s[0] for s in JobCard.JOB_STATUS_CHOICES]
        try:
            return stages.index(obj.current_stage)
        except ValueError:
            return 0
