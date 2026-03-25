from django.urls import path
from .views import (
    VehicleCategoryListView, ServiceCategoryListView,
    CarWashServiceListView, CarWashServiceDetailView,
    CeramicCoatingListView, CeramicCoatingDetailView,
    ServicePricingListView,
    AdminCarWashServiceCreateView, AdminCarWashServiceUpdateDeleteView,
    AdminCeramicCoatingCreateView, AdminCeramicCoatingUpdateDeleteView,
)

urlpatterns = [
    path('vehicle-categories/', VehicleCategoryListView.as_view(), name='vehicle-categories'),
    path('categories/', ServiceCategoryListView.as_view(), name='service-categories'),
    path('car-wash/', CarWashServiceListView.as_view(), name='car-wash-list'),
    path('car-wash/<int:pk>/', CarWashServiceDetailView.as_view(), name='car-wash-detail'),
    path('ceramic-coating/', CeramicCoatingListView.as_view(), name='ceramic-coating-list'),
    path('ceramic-coating/<int:pk>/', CeramicCoatingDetailView.as_view(), name='ceramic-coating-detail'),
    path('pricing/', ServicePricingListView.as_view(), name='service-pricing'),
    
    # Admin CRUD
    path('admin/car-wash/', AdminCarWashServiceCreateView.as_view(), name='admin-car-wash-create'),
    path('admin/car-wash/<int:pk>/', AdminCarWashServiceUpdateDeleteView.as_view(), name='admin-car-wash-update-delete'),
    path('admin/ceramic-coating/', AdminCeramicCoatingCreateView.as_view(), name='admin-ceramic-coating-create'),
    path('admin/ceramic-coating/<int:pk>/', AdminCeramicCoatingUpdateDeleteView.as_view(), name='admin-ceramic-coating-update-delete'),
]
