import csv
import io

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.response import Response

from apps.core.permissions import HasPermission, granular_permissions, view_manage_permissions
from apps.geography.models import District, PoliceStation

from .models import Offender, ParoleCondition, ParoleIncident
from .serializers import OffenderSerializer, ParoleConditionSerializer, ParoleIncidentSerializer

BULK_UPLOAD_REQUIRED_FIELDS = ["name", "district", "police_station", "latitude", "longitude"]
BULK_UPLOAD_TRUE_VALUES = {"true", "1", "yes", "y"}


class OffenderViewSet(viewsets.ModelViewSet):
    queryset = Offender.objects.select_related("district", "police_station", "ps_arrested").all()
    serializer_class = OffenderSerializer
    permission_classes = [HasPermission]
    permission_map = {**granular_permissions("offender"), "bulk_upload": "offender.create"}
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["district", "police_station", "parole_status", "risk_level"]
    search_fields = ["name", "aliases", "mobile_no", "present_address"]
    ordering_fields = ["created_at", "name", "risk_level", "date_of_last_arrest"]

    @action(detail=False, methods=["post"], url_path="bulk-upload")
    def bulk_upload(self, request):
        """Create many offenders from an uploaded CSV file.

        Rows are processed independently (best-effort import): invalid rows
        are reported with their errors instead of failing the whole batch.
        """
        upload = request.FILES.get("file")
        if not upload:
            return Response({"detail": "No file uploaded."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            decoded = upload.read().decode("utf-8-sig")
        except UnicodeDecodeError:
            return Response(
                {"detail": "File must be a UTF-8 encoded CSV."}, status=status.HTTP_400_BAD_REQUEST
            )

        reader = csv.DictReader(io.StringIO(decoded))
        if not reader.fieldnames:
            return Response({"detail": "CSV file is empty."}, status=status.HTTP_400_BAD_REQUEST)

        missing_columns = [f for f in BULK_UPLOAD_REQUIRED_FIELDS if f not in reader.fieldnames]
        if missing_columns:
            return Response(
                {"detail": f"Missing required column(s): {', '.join(missing_columns)}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        rows = list(reader)
        district_cache: dict[str, District] = {}
        station_cache: dict[tuple[int, str], PoliceStation] = {}

        created = 0
        errors = []

        for row_index, raw_row in enumerate(rows, start=2):  # header occupies row 1
            row = {key: (value or "").strip() for key, value in raw_row.items() if key}
            row_errors: dict[str, list[str]] = {}

            for field in BULK_UPLOAD_REQUIRED_FIELDS:
                if not row.get(field):
                    row_errors.setdefault(field, []).append("This field is required.")

            district = None
            if row.get("district"):
                cache_key = row["district"].lower()
                district = district_cache.get(cache_key)
                if district is None:
                    district = District.objects.filter(name__iexact=row["district"]).first()
                    if district:
                        district_cache[cache_key] = district
                if district is None:
                    row_errors.setdefault("district", []).append(
                        f"No district named '{row['district']}'."
                    )

            police_station = None
            if district and row.get("police_station"):
                cache_key = (district.id, row["police_station"].lower())
                police_station = station_cache.get(cache_key)
                if police_station is None:
                    police_station = PoliceStation.objects.filter(
                        district=district, name__iexact=row["police_station"]
                    ).first()
                    if police_station:
                        station_cache[cache_key] = police_station
                if police_station is None:
                    row_errors.setdefault("police_station", []).append(
                        f"No police station named '{row['police_station']}' in district '{district.name}'."
                    )

            if row_errors:
                errors.append({"row": row_index, "errors": row_errors})
                continue

            payload = {
                "name": row["name"],
                "aliases": row.get("aliases", ""),
                "date_of_birth": row.get("date_of_birth") or None,
                "mobile_no": row.get("mobile_no", ""),
                "present_address": row.get("present_address", ""),
                "date_of_last_arrest": row.get("date_of_last_arrest") or None,
                "district": district.id,
                "police_station": police_station.id,
                "latitude": row["latitude"],
                "longitude": row["longitude"],
                "parole_status": row.get("parole_status") or "active",
                "case_number": row.get("case_number", ""),
                "gps_monitor_enabled": row.get("gps_monitor_enabled", "").lower() in BULK_UPLOAD_TRUE_VALUES,
                "height": row.get("height", ""),
                "weight": row.get("weight", ""),
                "eye_color": row.get("eye_color", ""),
                "employer_name": row.get("employer_name", ""),
                "conviction_summary": row.get("conviction_summary", ""),
                "sentence_years": row.get("sentence_years") or None,
                "years_served": row.get("years_served") or None,
                "parole_granted_date": row.get("parole_granted_date") or None,
                "parole_end_date": row.get("parole_end_date") or None,
            }

            serializer = OffenderSerializer(data=payload)
            if serializer.is_valid():
                serializer.save()
                created += 1
            else:
                errors.append({"row": row_index, "errors": serializer.errors})

        return Response(
            {"created": created, "total_rows": len(rows), "errors": errors},
            status=status.HTTP_200_OK,
        )


class ParoleConditionViewSet(viewsets.ModelViewSet):
    queryset = ParoleCondition.objects.select_related("offender").all()
    serializer_class = ParoleConditionSerializer
    permission_classes = [HasPermission]
    permission_map = view_manage_permissions("offender.view", "offender.edit")
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["offender"]


class ParoleIncidentViewSet(viewsets.ModelViewSet):
    queryset = ParoleIncident.objects.select_related("offender", "added_by").all()
    serializer_class = ParoleIncidentSerializer
    permission_classes = [HasPermission]
    permission_map = view_manage_permissions("offender.view", "offender.edit")
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["offender", "incident_type", "status"]
