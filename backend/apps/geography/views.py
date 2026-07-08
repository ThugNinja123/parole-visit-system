from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.filters import SearchFilter

from apps.core.permissions import HasPermission, view_manage_permissions

from .models import District, PoliceStation
from .serializers import DistrictSerializer, PoliceStationSerializer


class DistrictViewSet(viewsets.ModelViewSet):
    queryset = District.objects.all()
    serializer_class = DistrictSerializer
    permission_classes = [HasPermission]
    permission_map = view_manage_permissions("geography.view", "geography.manage")
    filter_backends = [SearchFilter]
    search_fields = ["name", "code"]


class PoliceStationViewSet(viewsets.ModelViewSet):
    queryset = PoliceStation.objects.select_related("district").all()
    serializer_class = PoliceStationSerializer
    permission_classes = [HasPermission]
    permission_map = view_manage_permissions("geography.view", "geography.manage")
    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ["name", "code", "district__name"]
    filterset_fields = ["district"]
