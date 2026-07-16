from rest_framework.permissions import BasePermission


class IsApprovedUser(BasePermission):
    """Require an authenticated account that is still approved."""

    message = 'Your account is not approved.'

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and user.is_active
            and getattr(user, 'approval_status', None) == 'approved'
        )
