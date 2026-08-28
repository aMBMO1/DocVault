from django.contrib import admin
from django.conf import settings
from django.urls import include, path, re_path
from django.views.static import serve

from rest_framework_simplejwt.views import (
    TokenRefreshView,
)


urlpatterns = [
    # Django Admin
    path(
        "admin/",
        admin.site.urls,
    ),

    # API
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

    # Media
    re_path(
        r"^media/(?P<path>.*)$",
        serve,
        {
            "document_root":
                settings.MEDIA_ROOT,
        },
    ),
]