from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from apps.core.permissions import HasPermission

from .models import LocationStatus, VisitRecord, VisitSchedule
from .serializers import (
    VisitRecordReviewSerializer,
    VisitRecordSerializer,
    VisitScheduleSerializer,
)


class VisitScheduleViewSet(viewsets.ModelViewSet):
    queryset = VisitSchedule.objects.select_related("offender", "assigned_officer").all()
    serializer_class = VisitScheduleSerializer
    permission_classes = [HasPermission]
    permission_map = {
        "list": "visit.view",
        "retrieve": "visit.view",
        "create": "visit.schedule",
        "update": "visit.schedule",
        "partial_update": "visit.schedule",
        "destroy": "visit.schedule",
        "mine": "visit.view",
    }
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["offender", "assigned_officer", "status", "scheduled_date"]

    @action(detail=False, methods=["get"])
    def mine(self, request):
        """Visits assigned to the current officer (e.g. today's worklist)."""
        queryset = self.filter_queryset(self.get_queryset().filter(assigned_officer=request.user))
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page or queryset, many=True)
        return self.get_paginated_response(serializer.data) if page is not None else Response(serializer.data)


class VisitRecordViewSet(viewsets.ModelViewSet):
    queryset = VisitRecord.objects.select_related("offender", "officer", "schedule", "reviewed_by").all()
    serializer_class = VisitRecordSerializer
    permission_classes = [HasPermission]
    permission_map = {
        "list": "visit.view",
        "retrieve": "visit.view",
        "create": "visit.submit",
        "update": "visit.review",
        "partial_update": "visit.review",
        "destroy": "visit.review",
        "flagged": "visit.review",
        "review": "visit.review",
    }
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["offender", "officer", "location_status", "schedule"]

    def perform_create(self, serializer):
        schedule = serializer.validated_data.get("schedule")
        user = self.request.user
        if schedule and schedule.assigned_officer_id != user.id and not (
            user.is_superuser or user.has_permission_code("visit.review")
        ):
            raise PermissionDenied("You can only submit visit records for your own assigned schedules.")
        serializer.save()

    @action(detail=False, methods=["get"])
    def flagged(self, request):
        """Location-mismatch visits awaiting supervisor review."""
        queryset = self.filter_queryset(
            self.get_queryset().filter(location_status=LocationStatus.FLAGGED, reviewed_at__isnull=True)
        )
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page or queryset, many=True)
        return self.get_paginated_response(serializer.data) if page is not None else Response(serializer.data)

    @action(detail=True, methods=["post"])
    def review(self, request, pk=None):
        record = self.get_object()
        serializer = VisitRecordReviewSerializer(
            data=request.data, context={"request": request, "record": record}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(VisitRecordSerializer(record).data)
