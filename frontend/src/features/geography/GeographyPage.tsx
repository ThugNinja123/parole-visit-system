import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useState } from "react";

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
import { PermissionGate } from "@/components/PermissionGate";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { FormField, Select } from "@/components/ui/Input";
import { FullPageSpinner } from "@/components/ui/Spinner";
import type { District, PoliceStation } from "@/types";

import { DistrictFormModal } from "@/features/geography/DistrictFormModal";
import { PoliceStationFormModal } from "@/features/geography/PoliceStationFormModal";

function extractErrorMessage(err: unknown, fallback: string): string {
  return isAxiosError<{ detail?: string }>(err) && err.response?.data?.detail
    ? err.response.data.detail
    : fallback;
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
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              tab === key
                ? "border-b-2 border-primary text-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {key === "districts" ? "Districts" : "Police Stations"}
          </button>
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
            {districtsQuery.data?.length === 0 && (
              <p className="text-sm text-on-surface-variant">No districts yet.</p>
            )}
            {districtsQuery.data?.map((district) => (
              <div
                key={district.id}
                className="flex items-center justify-between rounded border border-outline-variant px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-on-surface">{district.name}</p>
                  <p className="text-xs text-on-surface-variant">
                    {district.code || "No code"} -{" "}
                    {district.latitude != null && district.longitude != null
                      ? "Location set"
                      : "No location set"}
                  </p>
                </div>
                <PermissionGate code="geography.manage">
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setEditingDistrict(district)}>
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        setDistrictDeleteError(null);
                        deleteDistrictMutation.mutate(district.id);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </PermissionGate>
              </div>
            ))}
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
                value={stationDistrictFilter}
                onChange={(e) => setStationDistrictFilter(e.target.value ? Number(e.target.value) : "")}
                className="max-w-xs"
              >
                <option value="">All districts</option>
                {districtsQuery.data?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Select>
            </FormField>

            {stationDeleteError && <p className="text-sm text-error">{stationDeleteError}</p>}
            {stationsQuery.isLoading && <FullPageSpinner />}
            <div className="space-y-3">
              {stationsQuery.data?.length === 0 && (
                <p className="text-sm text-on-surface-variant">No police stations found.</p>
              )}
              {stationsQuery.data?.map((station) => (
                <div
                  key={station.id}
                  className="flex items-center justify-between rounded border border-outline-variant px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-on-surface">{station.name}</p>
                    <p className="text-xs text-on-surface-variant">
                      {station.district_name} - {station.code || "No code"} -{" "}
                      {station.latitude != null && station.longitude != null
                        ? "Location set"
                        : "No location set"}
                    </p>
                  </div>
                  <PermissionGate code="geography.manage">
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={() => setEditingStation(station)}>
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => {
                          setStationDeleteError(null);
                          deleteStationMutation.mutate(station.id);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </PermissionGate>
                </div>
              ))}
            </div>
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
