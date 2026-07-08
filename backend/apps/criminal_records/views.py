from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets

from apps.core.permissions import HasPermission, view_manage_permissions

from .models import Crime, InventoryItem
from .serializers import CrimeSerializer, InventoryItemSerializer


class CrimeViewSet(viewsets.ModelViewSet):
    queryset = Crime.objects.select_related("offender", "added_by").all()
    serializer_class = CrimeSerializer
    permission_classes = [HasPermission]
    permission_map = view_manage_permissions("crime.view", "crime.manage")
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["offender", "crime_type"]


class InventoryItemViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.select_related("offender", "crime", "added_by").all()
    serializer_class = InventoryItemSerializer
    permission_classes = [HasPermission]
    permission_map = view_manage_permissions("inventory.view", "inventory.manage")
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["offender", "crime", "item_type", "status"]
