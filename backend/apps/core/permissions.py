from rest_framework.permissions import BasePermission


class HasPermission(BasePermission):
    """Generic DRF permission class driven by a per-viewset `permission_map`
    (dict of DRF action name -> required permission code).

    Build the map with the helpers below rather than by hand::

        permission_map = granular_permissions("offender")
        permission_map = view_manage_permissions("geography.view", "geography.manage")
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True

        permission_map = getattr(view, "permission_map", None) or {}
        action = getattr(view, "action", None)
        code = permission_map.get(action)

        if code is None:
            return False

        return request.user.has_permission_code(code)


def require_permission(code):
    """Permission class factory for a single fixed permission code, for
    APIView-based endpoints that aren't ViewSets."""

    class _RequireSpecificPermission(BasePermission):
        def has_permission(self, request, view):
            if not request.user or not request.user.is_authenticated:
                return False
            if request.user.is_superuser:
                return True
            return request.user.has_permission_code(code)

    return _RequireSpecificPermission


def granular_permissions(prefix):
    """Standard view/create/edit/delete permission codes for a CRUD resource."""
    return {
        "list": f"{prefix}.view",
        "retrieve": f"{prefix}.view",
        "create": f"{prefix}.create",
        "update": f"{prefix}.edit",
        "partial_update": f"{prefix}.edit",
        "destroy": f"{prefix}.delete",
    }


def view_manage_permissions(view_code, manage_code):
    """A single 'manage' permission covers create/update/delete; a separate
    'view' permission covers read access. Useful for simple reference data
    and admin-style resources (roles, users, geography, crimes, inventory)."""
    return {
        "list": view_code,
        "retrieve": view_code,
        "create": manage_code,
        "update": manage_code,
        "partial_update": manage_code,
        "destroy": manage_code,
    }
