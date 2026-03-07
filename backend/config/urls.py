"""
URL configuration for 404 Car Care project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),


    path('api/auth/', include('accounts.urls')),
    path('api/services/', include('services.urls')),
    path('api/vehicles/', include('vehicles.urls')),
    path('api/bookings/', include('bookings.urls')),
    path('api/monitoring/', include('monitoring.urls')),
    path('api/airports/', include('airports.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


admin.site.site_header = "404 Car Care Admin"
admin.site.site_title = "404 Car Care"
admin.site.index_title = "Welcome to 404 Car Care Management Portal"
