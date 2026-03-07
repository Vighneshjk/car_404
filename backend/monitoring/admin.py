from django.contrib import admin
from .models import JobCard, JobStageLog, WorkLog


class JobStageLogInline(admin.TabularInline):
    model = JobStageLog
    extra = 0
    readonly_fields = ['started_at']


class WorkLogInline(admin.TabularInline):
    model = WorkLog
    extra = 0
    readonly_fields = ['timestamp']


@admin.register(JobCard)
class JobCardAdmin(admin.ModelAdmin):
    list_display = ['booking', 'current_stage', 'bay_number', 'is_rush', 'started_at', 'completed_at']
    list_filter = ['current_stage', 'is_rush']
    search_fields = ['booking__booking_id', 'booking__customer__email']
    inlines = [JobStageLogInline, WorkLogInline]
    filter_horizontal = ['assigned_staff']


@admin.register(JobStageLog)
class JobStageLogAdmin(admin.ModelAdmin):
    list_display = ['job', 'stage', 'status', 'started_by', 'started_at', 'completed_at']
    list_filter = ['stage', 'status']


@admin.register(WorkLog)
class WorkLogAdmin(admin.ModelAdmin):
    list_display = ['job', 'staff', 'action', 'timestamp']
    list_filter = ['action']
    readonly_fields = ['timestamp']
