import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { isAxiosError } from "axios";
import { Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import {
  createDistrict,
  createPoliceStation,
  deleteDistrict,
  deletePoliceStation,
  fetchDistricts,
  fetchPoliceStations,
  updateDistrict,
  updatePoliceStation,
} from "@/api/geography";
import { DataGrid } from "@/components/DataGrid";
import { PermissionGate } from "@/components/PermissionGate";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { FormField } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FullPageSpinner } from "@/components/ui/Spinner";
import type { District, PoliceStation } from "@/types";

import { DistrictFormModal } from "@/features/geography/DistrictFormModal";
import { PoliceStationFormModal } from "@/features/geography/PoliceStationFormModal";

function extractErrorMessage(err: unknown, fallback: string): string {
  return isAxiosError<{ detail?: string }>(err) && err.response?.data?.detail
    ? err.response.data.detail
    : fallback;
}

interface DistrictGridContext {
  onEdit: (district: District) => void;
  onDelete: (id: number) => void;
}

interface StationGridContext {
  onEdit: (station: PoliceStation) => void;
  onDelete: (id: number) => void;
}

function locationLabel(latitude: number | null, longitude: number | null): string {
  return latitude != null && longitude != null ? "Location set" : "No location set";
}

function DistrictNameRenderer({ data }: ICellRendererParams<District>) {
  if (!data) return null;
  return (
    <div className="py-1">
      <p className="text-sm font-medium text-on-surface">{data.name}</p>
      <p className="text-xs text-on-surface-variant">
        {data.code || "No code"} - {locationLabel(data.latitude, data.longitude)}
      </p>
    </div>
  );
}

function StationNameRenderer({ data }: ICellRendererParams<PoliceStation>) {
  if (!data) return null;
  return (
    <div className="py-1">
      <p className="text-sm font-medium text-on-surface">{data.name}</p>
      <p className="text-xs text-on-surface-variant">
        {data.district_name} - {data.code || "No code"} - {locationLabel(data.latitude, data.longitude)}
      </p>
    </div>
  );
}

function DistrictActionsRenderer({
  data,
  context,
}: ICellRendererParams<District, unknown, DistrictGridContext>) {
  if (!data) return null;
  return (
    <PermissionGate code="geography.manage">
      <div className="flex h-full items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Edit ${data.name}`}
          onClick={() => context.onEdit(data)}
        >
          <Pencil className="h-4 w-4" aria-hidden />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Delete ${data.name}`}
          className="text-error hover:bg-error-container hover:text-on-error-container"
          onClick={() => context.onDelete(data.id)}
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </PermissionGate>
  );
}

function StationActionsRenderer({
  data,
  context,
}: ICellRendererParams<PoliceStation, unknown, StationGridContext>) {
  if (!data) return null;
  return (
    <PermissionGate code="geography.manage">
      <div className="flex h-full items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Edit ${data.name}`}
          onClick={() => context.onEdit(data)}
        >
          <Pencil className="h-4 w-4" aria-hidden />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Delete ${data.name}`}
          className="text-error hover:bg-error-container hover:text-on-error-container"
          onClick={() => context.onDelete(data.id)}
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </PermissionGate>
  );
}

export function GeographyPage() {
  const [tab, setTab] = useState<"districts" | "stations">("districts");
  const [stationDistrictFilter, setStationDistrictFilter] = useState<number | "">("");
  const [editingDistrict, setEditingDistrict] = useState<District | "new" | null>(null);
  const [editingStation, setEditingStation] = useState<PoliceStation | "new" | null>(null);
  const [districtDeleteError, setDistrictDeleteError] = useState<string | null>(null);
  const [stationDeleteError, setStationDeleteError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const districtsQuery = useQuery({ queryKey: ["districts"], queryFn: fetchDistricts });
  const stationsQuery = useQuery({
    queryKey: ["police-stations", stationDistrictFilter || "all"],
    queryFn: () => fetchPoliceStations(stationDistrictFilter || undefined),
    enabled: tab === "stations",
  });

  const saveDistrictMutation = useMutation({
    mutationFn: (payload: Parameters<typeof createDistrict>[0]) =>
      editingDistrict && editingDistrict !== "new" ? updateDistrict(editingDistrict.id, payload) : createDistrict(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["districts"] });
      setEditingDistrict(null);
    },
  });

  const deleteDistrictMutation = useMutation({
    mutationFn: deleteDistrict,
    onSuccess: () => {
      setDistrictDeleteError(null);
      queryClient.invalidateQueries({ queryKey: ["districts"] });
    },
    onError: (err) => {
      setDistrictDeleteError(
        extractErrorMessage(err, "Failed to delete district. Please try again."),
      );
    },
  });

  const saveStationMutation = useMutation({
    mutationFn: (payload: Parameters<typeof createPoliceStation>[0]) =>
      editingStation && editingStation !== "new"
        ? updatePoliceStation(editingStation.id, payload)
        : createPoliceStation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["police-stations"] });
      setEditingStation(null);
    },
  });

  const deleteStationMutation = useMutation({
    mutationFn: deletePoliceStation,
    onSuccess: () => {
      setStationDeleteError(null);
      queryClient.invalidateQueries({ queryKey: ["police-stations"] });
    },
    onError: (err) => {
      setStationDeleteError(
        extractErrorMessage(err, "Failed to delete police station. Please try again."),
      );
    },
  });

  const districtColumnDefs = useMemo<ColDef<District>[]>(
    () => [
      {
        headerName: "District",
        field: "name",
        flex: 1,
        minWidth: 240,
        sortable: true,
        cellRenderer: DistrictNameRenderer,
        autoHeight: true,
      },
      {
        headerName: "Actions",
        width: 180,
        sortable: false,
        resizable: false,
        cellRenderer: DistrictActionsRenderer,
      },
    ],
    [],
  );

  const stationColumnDefs = useMemo<ColDef<PoliceStation>[]>(
    () => [
      {
        headerName: "Police station",
        field: "name",
        flex: 1,
        minWidth: 280,
        sortable: true,
        cellRenderer: StationNameRenderer,
        autoHeight: true,
      },
      {
        headerName: "Actions",
        width: 180,
        sortable: false,
        resizable: false,
        cellRenderer: StationActionsRenderer,
      },
    ],
    [],
  );

  const districtGridContext = useMemo<DistrictGridContext>(
    () => ({
      onEdit: setEditingDistrict,
      onDelete: (id) => {
        setDistrictDeleteError(null);
        deleteDistrictMutation.mutate(id);
      },
    }),
    [deleteDistrictMutation],
  );

  const stationGridContext = useMemo<StationGridContext>(
    () => ({
      onEdit: setEditingStation,
      onDelete: (id) => {
        setStationDeleteError(null);
        deleteStationMutation.mutate(id);
      },
    }),
    [deleteStationMutation],
  );

  if (districtsQuery.isLoading) return <FullPageSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-headline-lg text-on-surface">Districts & Police Stations</h1>
        <p className="text-body-sm text-on-surface-variant">
          Manage the districts and police stations used across offender records and officer assignments.
        </p>
      </div>

      <div className="flex gap-1 border-b border-outline-variant">
        {(["districts", "stations"] as const).map((key) => (
          <Button
            key={key}
            type="button"
            variant="ghost"
            onClick={() => setTab(key)}
            className={`rounded-none px-4 py-2 capitalize ${
              tab === key
                ? "border-b-2 border-primary text-primary hover:bg-transparent"
                : "text-on-surface-variant"
            }`}
          >
            {key === "districts" ? "Districts" : "Police Stations"}
          </Button>
        ))}
      </div>

      {tab === "districts" && (
        <Card>
          <CardHeader>
            <h2 className="text-headline-md text-on-surface">Districts</h2>
            <PermissionGate code="geography.manage">
              <Button onClick={() => setEditingDistrict("new")}>+ Create district</Button>
            </PermissionGate>
          </CardHeader>
          <CardBody className="space-y-3">
            {districtDeleteError && <p className="text-sm text-error">{districtDeleteError}</p>}
            <DataGrid<District>
              rowData={districtsQuery.data ?? []}
              columnDefs={districtColumnDefs}
              context={districtGridContext}
              rowHeight={56}
              headerHeight={40}
              overlayNoRowsTemplate='<span class="text-sm text-on-surface-variant">No districts yet.</span>'
            />
          </CardBody>
        </Card>
      )}

      {tab === "stations" && (
        <Card>
          <CardHeader>
            <h2 className="text-headline-md text-on-surface">Police Stations</h2>
            <PermissionGate code="geography.manage">
              <Button onClick={() => setEditingStation("new")}>+ Create police station</Button>
            </PermissionGate>
          </CardHeader>
          <CardBody className="space-y-4">
            <FormField label="Filter by district">
              <Select
                aria-label="Filter by district"
                value={stationDistrictFilter === "" ? "" : String(stationDistrictFilter)}
                onValueChange={(v) => setStationDistrictFilter(v ? Number(v) : "")}
                className="max-w-xs"
                options={[
                  { value: "", label: "All districts" },
                  ...(districtsQuery.data?.map((d) => ({ value: String(d.id), label: d.name })) ?? []),
                ]}
              />
            </FormField>

            {stationDeleteError && <p className="text-sm text-error">{stationDeleteError}</p>}
            {stationsQuery.isLoading ? (
              <FullPageSpinner />
            ) : (
              <DataGrid<PoliceStation>
                rowData={stationsQuery.data ?? []}
                columnDefs={stationColumnDefs}
                context={stationGridContext}
                rowHeight={56}
                headerHeight={40}
                overlayNoRowsTemplate='<span class="text-sm text-on-surface-variant">No police stations found.</span>'
              />
            )}
          </CardBody>
        </Card>
      )}

      {editingDistrict && (
        <DistrictFormModal
          initial={editingDistrict === "new" ? undefined : editingDistrict}
          onClose={() => setEditingDistrict(null)}
          onSubmit={(payload) => saveDistrictMutation.mutate(payload)}
          isSubmitting={saveDistrictMutation.isPending}
        />
      )}
      {editingStation && (
        <PoliceStationFormModal
          initial={editingStation === "new" ? undefined : editingStation}
          districts={districtsQuery.data ?? []}
          onClose={() => setEditingStation(null)}
          onSubmit={(payload) => saveStationMutation.mutate(payload)}
          isSubmitting={saveStationMutation.isPending}
        />
      )}
    </div>
  );
}
