from django.urls import path
from .views import AirportListView, FacilityLocationView

urlpatterns = [
    path('', AirportListView.as_view(), name='airport-list'),
    path('location/', FacilityLocationView.as_view(), name='facility-location'),
]
