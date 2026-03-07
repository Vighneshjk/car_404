from rest_framework import generics, permissions
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from .models import (
    VehicleCategory, ServiceCategory,
    CarWashService, CeramicCoatingType, ServicePricing
)
from .serializers import (
    VehicleCategorySerializer, ServiceCategorySerializer,
    CarWashServiceSerializer, CeramicCoatingTypeSerializer,
    ServicePricingDetailSerializer
)


class VehicleCategoryListView(generics.ListAPIView):
    """List all vehicle categories."""
    queryset = VehicleCategory.objects.all()
    serializer_class = VehicleCategorySerializer
    permission_classes = [permissions.AllowAny]


class ServiceCategoryListView(generics.ListAPIView):
    """List all active service categories."""
    queryset = ServiceCategory.objects.filter(is_active=True)
    serializer_class = ServiceCategorySerializer
    permission_classes = [permissions.AllowAny]


class CarWashServiceListView(generics.ListAPIView):
    """List all active car wash services with pricing."""
    serializer_class = CarWashServiceSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['wash_type', 'is_featured', 'category']
    search_fields = ['name', 'description']

    def get_queryset(self):
        return CarWashService.objects.filter(is_active=True).prefetch_related('pricing__vehicle_category', 'category')


class CarWashServiceDetailView(generics.RetrieveAPIView):
    """Detail view of a specific car wash service."""
    serializer_class = CarWashServiceSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return CarWashService.objects.filter(is_active=True).prefetch_related('pricing__vehicle_category', 'category')


class CeramicCoatingListView(generics.ListAPIView):
    """List all active ceramic coating types with pricing."""
    serializer_class = CeramicCoatingTypeSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['coating_type', 'is_featured']
    search_fields = ['name', 'description']

    def get_queryset(self):
        return CeramicCoatingType.objects.filter(is_active=True).prefetch_related('pricing__vehicle_category', 'category')


class CeramicCoatingDetailView(generics.RetrieveAPIView):
    """Detail view of a specific ceramic coating type."""
    serializer_class = CeramicCoatingTypeSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return CeramicCoatingType.objects.filter(is_active=True).prefetch_related('pricing__vehicle_category', 'category')


class ServicePricingListView(generics.ListAPIView):
    """Full pricing matrix across all services and vehicle categories."""
    serializer_class = ServicePricingDetailSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['vehicle_category', 'car_wash', 'ceramic_coating']

    def get_queryset(self):
        return ServicePricing.objects.filter(is_active=True).select_related(
            'car_wash', 'ceramic_coating', 'vehicle_category'
        )
