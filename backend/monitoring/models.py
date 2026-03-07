from django.db import models
from django.conf import settings


class JobCard(models.Model):
    """Work order generated from a confirmed booking."""
    STAGE_WAITING = 'waiting'
    STAGE_PREP = 'preparation'
    STAGE_WASH = 'washing'
    STAGE_COATING = 'coating'
    STAGE_DRYING = 'drying'
    STAGE_DETAILING = 'detailing'
    STAGE_QC = 'quality_check'
    STAGE_DONE = 'completed'

    JOB_STATUS_CHOICES = [
        (STAGE_WAITING, 'Waiting'),
        (STAGE_PREP, 'Preparation'),
        (STAGE_WASH, 'Washing'),
        (STAGE_COATING, 'Coating'),
        (STAGE_DRYING, 'Drying'),
        (STAGE_DETAILING, 'Detailing'),
        (STAGE_QC, 'Quality Check'),
        (STAGE_DONE, 'Completed'),
    ]

    booking = models.OneToOneField(
        'bookings.Booking', on_delete=models.CASCADE, related_name='job_card'
    )
    assigned_staff = models.ManyToManyField(
        settings.AUTH_USER_MODEL, blank=True,
        related_name='assigned_jobs', limit_choices_to={'role': 'staff'}
    )
    current_stage = models.CharField(max_length=20, choices=JOB_STATUS_CHOICES, default=STAGE_WAITING)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    estimated_completion = models.DateTimeField(null=True, blank=True)
    bay_number = models.CharField(max_length=10, blank=True, help_text='e.g. Bay 3')
    is_rush = models.BooleanField(default=False, help_text='Priority job')
    technician_notes = models.TextField(blank=True)
    before_photo = models.ImageField(upload_to='jobs/before/', null=True, blank=True)
    after_photo = models.ImageField(upload_to='jobs/after/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Job for Booking #{self.booking.booking_id}"


class JobStageLog(models.Model):
    """Tracks each stage transition of a job."""
    STATUS_IN_PROGRESS = 'in_progress'
    STATUS_DONE = 'done'
    STATUS_SKIPPED = 'skipped'

    STATUS_CHOICES = [
        (STATUS_IN_PROGRESS, 'In Progress'),
        (STATUS_DONE, 'Done'),
        (STATUS_SKIPPED, 'Skipped'),
    ]

    job = models.ForeignKey(JobCard, on_delete=models.CASCADE, related_name='stage_logs')
    stage = models.CharField(max_length=20, choices=JobCard.JOB_STATUS_CHOICES)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default=STATUS_IN_PROGRESS)
    started_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='stage_logs'
    )
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    photo = models.ImageField(upload_to='jobs/stages/', null=True, blank=True)

    class Meta:
        ordering = ['started_at']

    def __str__(self):
        return f"{self.job} — Stage: {self.get_stage_display()}"


class WorkLog(models.Model):
    """Audit log of staff actions on jobs."""
    ACTION_CHOICES = [
        ('started', 'Started Job'),
        ('stage_update', 'Stage Updated'),
        ('note_added', 'Note Added'),
        ('photo_uploaded', 'Photo Uploaded'),
        ('completed', 'Marked Complete'),
        ('assigned', 'Staff Assigned'),
    ]

    job = models.ForeignKey(JobCard, on_delete=models.CASCADE, related_name='work_logs')
    staff = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='work_logs'
    )
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    description = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.staff} — {self.action} on {self.job}"
