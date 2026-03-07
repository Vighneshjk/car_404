from django.urls import path
from .views import (
    JobCardListView, JobCardDetailView,
    StageUpdateView, DashboardView, CustomerJobStatusView,
    CustomerDashboardStatsView, CustomerJobListView
)

urlpatterns = [
    path('dashboard/', DashboardView.as_view(), name='monitoring-dashboard'),
    path('jobs/', JobCardListView.as_view(), name='job-list'),
    path('jobs/<int:pk>/', JobCardDetailView.as_view(), name='job-detail'),
    path('jobs/<int:pk>/update-stage/', StageUpdateView.as_view(), name='job-update-stage'),
    path('dashboard-stats/', CustomerDashboardStatsView.as_view(), name='customer-dashboard-stats'),
    path('customer-jobs/', CustomerJobListView.as_view(), name='customer-jobs'),
    path('track/<str:booking_id>/', CustomerJobStatusView.as_view(), name='customer-job-track'),
]
