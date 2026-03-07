from django.urls import path
from .views import (
    VehicleCategoryListView, ServiceCategoryListView,
    CarWashServiceListView, CarWashServiceDetailView,
    CeramicCoatingListView, CeramicCoatingDetailView,
    ServicePricingListView,
)

urlpatterns = [
    path('vehicle-categories/', VehicleCategoryListView.as_view(), name='vehicle-categories'),
    path('categories/', ServiceCategoryListView.as_view(), name='service-categories'),
    path('car-wash/', CarWashServiceListView.as_view(), name='car-wash-list'),
    path('car-wash/<int:pk>/', CarWashServiceDetailView.as_view(), name='car-wash-detail'),
    path('ceramic-coating/', CeramicCoatingListView.as_view(), name='ceramic-coating-list'),
    path('ceramic-coating/<int:pk>/', CeramicCoatingDetailView.as_view(), name='ceramic-coating-detail'),
    path('pricing/', ServicePricingListView.as_view(), name='service-pricing'),
]
