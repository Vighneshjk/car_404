from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from .models import Vehicle
from .serializers import VehicleSerializer, VehicleListSerializer


class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user or request.user.role in ['admin', 'staff']


class VehicleListCreateView(generics.ListCreateAPIView):
    """List customer's own vehicles or create a new one."""
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['category', 'fuel_type', 'is_active']
    search_fields = ['registration_number', 'make', 'model']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return VehicleSerializer
        return VehicleListSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'staff']:
            return Vehicle.objects.filter(is_active=True).select_related('owner', 'category')
        return Vehicle.objects.filter(owner=user, is_active=True).select_related('category')


class VehicleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update or soft-delete a specific vehicle."""
    serializer_class = VehicleSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        return Vehicle.objects.filter(is_active=True).select_related('owner', 'category')

    def perform_destroy(self, instance):
        # Soft delete
        instance.is_active = False
        instance.save()
