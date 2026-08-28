from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path

from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

urlpatterns = [
    # Django admin
    path(
        "admin/",
        admin.site.urls,
    ),

    # Main API
    path(
        "api/",
        include("documents.urls"),
    ),

    # JWT refresh
    path(
        "api/token/refresh/",
        TokenRefreshView.as_view(),
        name="token-refresh",
    ),
]

# Serve uploaded media files
# We keep this available for this project deployment.
urlpatterns += static(
    settings.MEDIA_URL,
    document_root=settings.MEDIA_ROOT,
)