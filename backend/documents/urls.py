from django.urls import path
from . import views

urlpatterns = [
    # Authentication
    path(
        "auth/login/",
        views.login_view,
        name="login",
    ),

    path(
        "me/",
        views.me_view,
        name="me",
    ),

    path(
        "profile/password/",
        views.change_password,
        name="change_password",
    ),

    # Users
    path(
        "users/",
        views.users_list,
        name="users_list",
    ),

    path(
        "users/create/",
        views.users_create,
        name="users_create",
    ),

    path(
        "users/<int:user_id>/",
        views.user_detail,
        name="user_detail",
    ),

    path(
        "users/<int:user_id>/status/",
        views.user_status,
        name="user_status",
    ),

    path(
        "users/<int:user_id>/rename/",
        views.user_detail,
        name="user_rename",
    ),

# =========================
# CATEGORIES
# =========================

path(
    "categories/",
    views.categories_list,
    name="categories_list",
),

path(
    "categories/create/",
    views.category_create,
    name="category_create",
),

# IMPORTANT:
# ID routes MUST come before the slug route

path(
    "categories/<int:category_id>/rename/",
    views.category_detail_by_id,
    name="category_rename",
),

path(
    "categories/<int:category_id>/",
    views.category_detail_by_id,
    name="category_detail_by_id",
),

# Slug route LAST
path(
    "categories/<slug:slug>/",
    views.category_detail,
    name="category_detail",
),

    # Documents
    path(
        "documents/",
        views.documents_list,
        name="documents_list",
    ),

    path(
        "documents/recent/",
        views.documents_recent,
        name="documents_recent",
    ),

    path(
        "documents/create/",
        views.document_create,
        name="document_create",
    ),

    path(
        "documents/<int:document_id>/",
        views.document_detail,
        name="document_detail",
    ),

    path(
        "documents/<int:document_id>/rename/",
        views.document_detail,
        name="document_rename",
    ),

    # Storage
    path(
        "storage/",
        views.storage_info,
        name="storage_info",
    ),
]