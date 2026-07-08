from itertools import groupby

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from apps.core.permissions import HasPermission, view_manage_permissions

from .models import Permission, Role, User
from .serializers import (
    CustomTokenObtainPairSerializer,
    MeSerializer,
    PermissionSerializer,
    RoleSerializer,
    UserListSerializer,
    UserWriteSerializer,
)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(MeSerializer(request.user).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def permission_catalog(request):
    """Full permission catalog grouped by category, for rendering the
    role checkbox matrix on the frontend."""
    perms = Permission.objects.all().order_by("category", "code")
    grouped = [
        {"category": category, "permissions": PermissionSerializer(list(items), many=True).data}
        for category, items in groupby(perms, key=lambda p: p.category)
    ]
    return Response(grouped)


class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.prefetch_related("permissions", "users").all()
    serializer_class = RoleSerializer
    permission_classes = [HasPermission]
    permission_map = view_manage_permissions("role.view", "role.manage")
    filter_backends = [SearchFilter]
    search_fields = ["name"]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.is_system:
            return Response(
                {"detail": "System roles cannot be deleted."}, status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.select_related("police_station").prefetch_related("roles").all()
    permission_classes = [HasPermission]
    permission_map = view_manage_permissions("user.view", "user.manage")
    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ["username", "first_name", "last_name", "email"]
    filterset_fields = ["police_station", "is_active"]

    def get_serializer_class(self):
        if self.action in ("list", "retrieve"):
            return UserListSerializer
        return UserWriteSerializer
