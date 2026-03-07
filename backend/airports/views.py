from rest_framework import generics, permissions
from .models import Airport, FacilityLocation
from .serializers import AirportSerializer, FacilityLocationSerializer


class AirportListView(generics.ListAPIView):
    """List all nearby airports sorted by distance."""
    queryset = Airport.objects.filter(is_active=True)
    serializer_class = AirportSerializer
    permission_classes = [permissions.AllowAny]


class FacilityLocationView(generics.ListAPIView):
    """Get all facility/branch locations."""
    queryset = FacilityLocation.objects.all()
    serializer_class = FacilityLocationSerializer
    permission_classes = [permissions.AllowAny]
