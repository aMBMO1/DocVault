from rest_framework.permissions import BasePermission


class IsAdminUserRole(BasePermission):
    message = "Accès réservé aux administrateurs."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "admin"
        )
