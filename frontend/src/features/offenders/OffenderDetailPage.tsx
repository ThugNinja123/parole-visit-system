import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { createCrime, createInventoryItem, fetchCrimes, fetchInventoryItems } from "@/api/criminalRecords";
import {
  createIncident,
  createParoleCondition,
  deleteParoleCondition,
  fetchIncidents,
  fetchOffender,
  fetchParoleConditions,
  updateOffender,
  type OffenderFormValues,
} from "@/api/offenders";
import { fetchVisitRecords } from "@/api/visits";
import { DataGrid } from "@/components/DataGrid";
import { PermissionGate } from "@/components/PermissionGate";
import { Badge, incidentStatusTone, locationStatusTone, riskTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { FullPageSpinner } from "@/components/ui/Spinner";

import { CrimeFormModal } from "@/features/offenders/CrimeFormModal";
import { IncidentFormModal } from "@/features/offenders/IncidentFormModal";
import { InventoryFormModal } from "@/features/offenders/InventoryFormModal";
import { OffenderFormModal } from "@/features/offenders/OffenderFormModal";
import { ParoleConditionFormModal } from "@/features/offenders/ParoleConditionFormModal";
import type { Crime, EyeColor, InventoryItem, ParoleIncident, VisitRecord, VisitType } from "@/types";

type TabKey = "overview" | "crimes" | "inventory" | "visits";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "crimes", label: "Criminal Record" },
  { key: "inventory", label: "Inventory" },
  { key: "visits", label: "Visit History" },
];

const EYE_COLOR_LABELS: Record<EyeColor, string> = {
  brown: "Brown",
  blue: "Blue",
  green: "Green",
  hazel: "Hazel",
  gray: "Gray",
  black: "Black",
  other: "Other",
  "": "-",
};

const VISIT_TYPE_LABELS: Record<VisitType, string> = {
  field_home: "Field Visit - Home",
  office_checkin: "Office Check-in",
  field_employer: "Field Visit - Employer",
  other: "Visit",
};

function timeAgo(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function formatLabel(value: string): string {
  return value.replace(/_/g, " ");
}

function IncidentTypeRenderer({ data }: ICellRendererParams<ParoleIncident>) {
  if (!data) return null;
  return <span className="capitalize text-on-surface">{formatLabel(data.incident_type)}</span>;
}

function IncidentStatusRenderer({ data }: ICellRendererParams<ParoleIncident>) {
  if (!data) return null;
  return <Badge tone={incidentStatusTone(data.status)}>{data.status}</Badge>;
}

function CrimeTypeRenderer({ data }: ICellRendererParams<Crime>) {
  if (!data) return null;
  return <span className="capitalize text-on-surface">{formatLabel(data.crime_type)}</span>;
}

function InventoryItemRenderer({ data }: ICellRendererParams<InventoryItem>) {
  if (!data) return null;
  return (
    <div className="py-1">
      <p className="text-sm font-medium capitalize text-on-surface">
        {data.item_type}: {data.description}
      </p>
      <p className="text-xs text-on-surface-variant">
        {data.quantity && `${data.quantity} - `}Stored at {data.storage_location}
      </p>
    </div>
  );
}

function InventoryStatusRenderer({ data }: ICellRendererParams<InventoryItem>) {
  if (!data) return null;
  return (
    <Badge tone={data.status === "in_custody" ? "blue" : "neutral"}>{formatLabel(data.status)}</Badge>
  );
}

function VisitLocationRenderer({ data }: ICellRendererParams<VisitRecord>) {
  if (!data) return null;
  return (
    <Badge tone={locationStatusTone(data.location_status)}>
      {data.location_status} ({Math.round(data.distance_meters)}m)
    </Badge>
  );
}

const incidentColumnDefs: ColDef<ParoleIncident>[] = [
  {
    headerName: "Date",
    field: "date",
    width: 110,
    sortable: true,
    cellClass: "font-data text-on-surface",
  },
  {
    headerName: "Type",
    field: "incident_type",
    flex: 1,
    minWidth: 120,
    sortable: true,
    cellRenderer: IncidentTypeRenderer,
  },
  {
    headerName: "Status",
    field: "status",
    width: 120,
    sortable: true,
    cellRenderer: IncidentStatusRenderer,
  },
];

const crimeColumnDefs: ColDef<Crime>[] = [
  {
    headerName: "Type",
    field: "crime_type",
    width: 140,
    sortable: true,
    cellRenderer: CrimeTypeRenderer,
  },
  {
    headerName: "Date",
    field: "date_committed",
    width: 120,
    sortable: true,
    valueFormatter: ({ value }) => (value ? String(value) : "Date unknown"),
    cellClass: "text-outline",
  },
  {
    headerName: "Case #",
    field: "case_number",
    width: 120,
    sortable: true,
    cellClass: "font-data text-on-surface-variant",
  },
  {
    headerName: "Description",
    field: "description",
    flex: 1,
    minWidth: 200,
    wrapText: true,
    autoHeight: true,
    cellClass: "text-on-surface-variant",
  },
];

const inventoryColumnDefs: ColDef<InventoryItem>[] = [
  {
    headerName: "Item",
    field: "description",
    flex: 1,
    minWidth: 240,
    sortable: true,
    cellRenderer: InventoryItemRenderer,
    autoHeight: true,
  },
  {
    headerName: "Status",
    field: "status",
    width: 120,
    sortable: true,
    cellRenderer: InventoryStatusRenderer,
  },
];

const visitColumnDefs: ColDef<VisitRecord>[] = [
  {
    headerName: "Visited at",
    field: "visited_at",
    width: 180,
    sortable: true,
    valueFormatter: ({ value }) => (value ? new Date(value as string).toLocaleString() : ""),
    cellClass: "text-on-surface",
  },
  {
    headerName: "Officer",
    field: "officer_name",
    width: 140,
    sortable: true,
  },
  {
    headerName: "Type",
    field: "visit_type",
    width: 170,
    sortable: true,
    valueFormatter: ({ value }) => VISIT_TYPE_LABELS[value as VisitType] ?? String(value),
    cellClass: "text-outline",
  },
  {
    headerName: "Location",
    width: 150,
    sortable: true,
    cellRenderer: VisitLocationRenderer,
  },
  {
    headerName: "Remarks",
    field: "remarks",
    flex: 1,
    minWidth: 180,
    wrapText: true,
    autoHeight: true,
    cellClass: "text-on-surface-variant",
  },
];

const recentVisitColumnDefs: ColDef<VisitRecord>[] = [
  {
    headerName: "When",
    field: "visited_at",
    width: 130,
    sortable: false,
    valueFormatter: ({ value }) => {
      if (!value) return "";
      const date = new Date(value as string);
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    },
    cellClass: "text-xs text-on-surface-variant",
  },
  {
    headerName: "Type",
    field: "visit_type",
    flex: 1,
    minWidth: 120,
    sortable: false,
    valueFormatter: ({ value }) => VISIT_TYPE_LABELS[value as VisitType] ?? String(value),
    cellClass: "text-label-md text-primary",
  },
  {
    headerName: "Officer",
    field: "officer_name",
    width: 120,
    sortable: false,
    valueFormatter: ({ value }) => `Officer ${value}`,
    cellClass: "text-xs text-outline",
  },
];

export function OffenderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const offenderId = Number(id);
  const [tab, setTab] = useState<TabKey>("overview");
  const [showEdit, setShowEdit] = useState(false);
  const [showAddCrime, setShowAddCrime] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCondition, setShowAddCondition] = useState(false);
  const [incidentModal, setIncidentModal] = useState<"flag" | "log" | null>(null);
  const queryClient = useQueryClient();

  const offenderQuery = useQuery({
    queryKey: ["offenders", offenderId],
    queryFn: () => fetchOffender(offenderId),
  });
  const crimesQuery = useQuery({
    queryKey: ["crimes", offenderId],
    queryFn: () => fetchCrimes(offenderId),
    enabled: tab === "crimes" || tab === "inventory" || showAddItem,
  });
  const inventoryQuery = useQuery({
    queryKey: ["inventory", offenderId],
    queryFn: () => fetchInventoryItems(offenderId),
    enabled: tab === "inventory",
  });
  const visitsQuery = useQuery({
    queryKey: ["visit-records", offenderId],
    queryFn: () => fetchVisitRecords(offenderId),
    enabled: tab === "visits" || tab === "overview",
  });
  const conditionsQuery = useQuery({
    queryKey: ["parole-conditions", offenderId],
    queryFn: () => fetchParoleConditions(offenderId),
    enabled: tab === "overview",
  });
  const incidentsQuery = useQuery({
    queryKey: ["parole-incidents", offenderId],
    queryFn: () => fetchIncidents(offenderId),
    enabled: tab === "overview",
  });

  const updateMutation = useMutation({
    mutationFn: (values: Partial<OffenderFormValues>) => updateOffender(offenderId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offenders", offenderId] });
      setShowEdit(false);
    },
  });

  const addCrimeMutation = useMutation({
    mutationFn: createCrime,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crimes", offenderId] });
      queryClient.invalidateQueries({ queryKey: ["offenders", offenderId] });
      setShowAddCrime(false);
    },
  });

  const addItemMutation = useMutation({
    mutationFn: createInventoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", offenderId] });
      setShowAddItem(false);
    },
  });

  const addConditionMutation = useMutation({
    mutationFn: createParoleCondition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parole-conditions", offenderId] });
      setShowAddCondition(false);
    },
  });

  const deleteConditionMutation = useMutation({
    mutationFn: deleteParoleCondition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parole-conditions", offenderId] });
    },
  });

  const addIncidentMutation = useMutation({
    mutationFn: createIncident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parole-incidents", offenderId] });
      setIncidentModal(null);
    },
  });

  if (offenderQuery.isLoading || !offenderQuery.data) return <FullPageSpinner />;
  const offender = offenderQuery.data;
  const recentVisits = visitsQuery.data?.results.slice(0, 4) ?? [];
  const recentIncidents = incidentsQuery.data?.slice(0, 5) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <Link to="/offenders" className="text-sm text-outline hover:text-on-surface">
          &larr; Back to offenders
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4 border-b border-outline-variant pb-4">
        <div>
          <h1 className="text-headline-lg text-on-surface">{offender.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Badge tone={riskTone(offender.risk_level)}>{offender.risk_level} risk</Badge>
            <Badge tone="blue">{offender.parole_status}</Badge>
            <span className="text-label-md text-outline">ID: #{offender.case_number || offender.id}</span>
            {offender.gps_monitor_enabled && (
              <span className="text-label-md text-outline">Active GPS Monitor</span>
            )}
          </div>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            {offender.district_name} / {offender.police_station_name}
            {offender.age !== null ? ` - Age ${offender.age}` : ""}
          </p>
          {offender.aliases && <p className="text-xs text-outline">aka {offender.aliases}</p>}
        </div>
        <div className="flex shrink-0 gap-2">
          <PermissionGate code="offender.edit">
            <Button variant="secondary" onClick={() => setShowEdit(true)}>
              Edit Profile
            </Button>
          </PermissionGate>
          <PermissionGate code="offender.edit">
            <Button variant="warning" onClick={() => setIncidentModal("flag")}>
              Flag Violation
            </Button>
          </PermissionGate>
        </div>
      </div>

      <div className="flex gap-1 border-b border-outline-variant">
        {TABS.map((t) => (
          <Button
            key={t.key}
            type="button"
            variant="ghost"
            onClick={() => setTab(t.key)}
            className={`rounded-none px-4 py-2 ${
              tab === t.key
                ? "border-b-2 border-primary text-primary hover:bg-transparent"
                : "text-on-surface-variant"
            }`}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          {/* Left column: Identity & primary details */}
          <div className="flex flex-col gap-3 lg:col-span-3">
            <Card className="overflow-hidden">
              <div className="border-b border-outline-variant">
                {offender.offender_image ? (
                  <img
                    src={offender.offender_image}
                    alt={offender.name}
                    className="h-64 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-64 w-full items-center justify-center bg-surface-container text-4xl text-on-surface-variant">
                    {offender.name.charAt(0)}
                  </div>
                )}
              </div>
              <CardBody className="grid grid-cols-2 gap-y-3 text-sm">
                <StatRow label="DOB" value={offender.date_of_birth ?? "-"} />
                <StatRow label="Height" value={offender.height || "-"} />
                <StatRow label="Weight" value={offender.weight || "-"} />
                <StatRow label="Eyes" value={EYE_COLOR_LABELS[offender.eye_color]} />
              </CardBody>
            </Card>

            <Card>
              <CardBody className="space-y-3">
                <div>
                  <h3 className="border-b border-outline-variant pb-1 text-label-md text-primary">
                    Primary residence
                  </h3>
                  <p className="mt-2 whitespace-pre-line text-sm font-medium text-on-surface">
                    {offender.present_address || "Not recorded"}
                  </p>
                </div>
                <div>
                  <h3 className="border-b border-outline-variant pb-1 text-label-md text-primary">Contact</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-on-surface-variant">Phone</span>
                      <span className="font-data text-on-surface">{offender.mobile_no || "-"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-on-surface-variant">Employer</span>
                      <span className="font-data text-on-surface">{offender.employer_name || "-"}</span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Center column: Conditions & case history */}
          <div className="flex flex-col gap-3 lg:col-span-5">
            <Card>
              <CardBody className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-headline-md text-on-surface">Parole Conditions</h2>
                  <PermissionGate code="offender.edit">
                    <Button variant="ghost" className="px-2! py-1! text-xs" onClick={() => setShowAddCondition(true)}>
                      + Add condition
                    </Button>
                  </PermissionGate>
                </div>
                <div className="space-y-2">
                  {conditionsQuery.data?.length === 0 && (
                    <p className="text-sm text-outline">No parole conditions recorded.</p>
                  )}
                  {conditionsQuery.data?.map((condition) => (
                    <div
                      key={condition.id}
                      className={`rounded-sm border p-3 ${
                        condition.is_violated
                          ? "border-error bg-error-container"
                          : "border-outline-variant bg-surface"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-label-md ${
                            condition.is_violated ? "text-on-error-container" : "text-on-surface"
                          }`}
                        >
                          {condition.title}
                        </p>
                        <PermissionGate code="offender.edit">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteConditionMutation.mutate(condition.id)}
                            className="h-auto px-1 text-xs text-outline hover:text-error"
                            aria-label="Remove condition"
                          >
                            ✕
                          </Button>
                        </PermissionGate>
                      </div>
                      {condition.description && (
                        <p
                          className={`mt-0.5 text-sm ${
                            condition.is_violated ? "text-on-error-container" : "text-on-surface-variant"
                          }`}
                        >
                          {condition.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="space-y-4">
                <h2 className="text-headline-md text-on-surface">Case Summary</h2>
                <div className="space-y-1 text-sm text-on-surface">
                  <p>
                    <span className="font-bold">Conviction:</span> {offender.conviction_summary || "Not recorded"}
                  </p>
                  <p>
                    <span className="font-bold">Sentence:</span>{" "}
                    {offender.sentence_years
                      ? `${offender.sentence_years} Years${
                          offender.years_served ? ` (Served ${offender.years_served})` : ""
                        }`
                      : "Not recorded"}
                  </p>
                  <p>
                    <span className="font-bold">Parole Granted:</span> {offender.parole_granted_date ?? "-"}
                    {" | "}
                    <span className="font-bold">End Date:</span> {offender.parole_end_date ?? "-"}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between border-b border-outline-variant pb-1">
                    <h3 className="text-label-md text-primary">Recent incidents</h3>
                    <PermissionGate code="offender.edit">
                      <Button variant="ghost" className="px-2! py-1! text-xs" onClick={() => setIncidentModal("log")}>
                        + Log incident
                      </Button>
                    </PermissionGate>
                  </div>
                  <div className="mt-1">
                    <DataGrid<ParoleIncident>
                      rowData={recentIncidents}
                      columnDefs={incidentColumnDefs}
                      rowHeight={40}
                      headerHeight={32}
                      overlayNoRowsTemplate='<span class="text-sm text-outline">No incidents recorded.</span>'
                    />
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right column: Location & visit logs */}
          <div className="flex flex-col gap-3 lg:col-span-4">
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-outline-variant bg-surface px-3 py-3">
                <h3 className="text-label-md text-primary">Last Known Location</h3>
                <Button
                  variant="primary"
                  className="px-2! py-1! text-xs"
                  onClick={() => {
                    queryClient.invalidateQueries({ queryKey: ["offenders", offenderId] });
                    queryClient.invalidateQueries({ queryKey: ["visit-records", offenderId] });
                  }}
                >
                  Verify GPS
                </Button>
              </div>
              <div className="flex h-48 flex-col items-center justify-center gap-2 bg-surface-container-highest px-4 text-center">
                {offender.last_visit ? (
                  <>
                    <p className="text-sm text-on-surface-variant">Ping: {timeAgo(offender.last_visit.visited_at)}</p>
                    <Badge tone={locationStatusTone(offender.last_visit.location_status)}>
                      {offender.last_visit.location_status === "verified"
                        ? "Within Curfew Bounds"
                        : "Flagged - Outside Bounds"}
                    </Badge>
                    <p className="text-xs text-outline">Checked by {offender.last_visit.checked_by}</p>
                  </>
                ) : (
                  <p className="text-sm text-outline">No location data yet.</p>
                )}
              </div>
            </Card>

            <Card>
              <CardBody className="space-y-4">
                <div className="flex items-center justify-between border-b border-outline-variant pb-2">
                  <h2 className="text-headline-md text-on-surface">Visit Logs</h2>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setTab("visits")}
                    className="h-auto px-0 text-xs font-medium text-primary hover:bg-transparent hover:underline"
                  >
                    View all
                  </Button>
                </div>
                <DataGrid<VisitRecord>
                  rowData={recentVisits}
                  columnDefs={recentVisitColumnDefs}
                  rowHeight={44}
                  headerHeight={32}
                  overlayNoRowsTemplate='<span class="text-sm text-outline">No visits recorded yet.</span>'
                />
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {tab === "crimes" && (
        <Card>
          <CardHeader>
            <h2 className="text-headline-md text-on-surface">Criminal record ({offender.crime_count})</h2>
            <PermissionGate code="crime.manage">
              <Button onClick={() => setShowAddCrime(true)}>+ Add crime</Button>
            </PermissionGate>
          </CardHeader>
          <CardBody>
            <DataGrid<Crime>
              rowData={crimesQuery.data ?? []}
              columnDefs={crimeColumnDefs}
              rowHeight={52}
              headerHeight={40}
              loading={crimesQuery.isLoading}
              overlayNoRowsTemplate='<span class="text-sm text-outline">No crimes recorded.</span>'
            />
          </CardBody>
        </Card>
      )}

      {tab === "inventory" && (
        <Card>
          <CardHeader>
            <h2 className="text-headline-md text-on-surface">Seized inventory / evidence</h2>
            <PermissionGate code="inventory.manage">
              <Button onClick={() => setShowAddItem(true)}>+ Add item</Button>
            </PermissionGate>
          </CardHeader>
          <CardBody>
            <DataGrid<InventoryItem>
              rowData={inventoryQuery.data ?? []}
              columnDefs={inventoryColumnDefs}
              rowHeight={56}
              headerHeight={40}
              loading={inventoryQuery.isLoading}
              overlayNoRowsTemplate='<span class="text-sm text-outline">No inventory items recorded.</span>'
            />
          </CardBody>
        </Card>
      )}

      {tab === "visits" && (
        <Card>
          <CardHeader>
            <h2 className="text-headline-md text-on-surface">Visit history</h2>
          </CardHeader>
          <CardBody>
            <DataGrid<VisitRecord>
              rowData={visitsQuery.data?.results ?? []}
              columnDefs={visitColumnDefs}
              rowHeight={52}
              headerHeight={40}
              loading={visitsQuery.isLoading}
              overlayNoRowsTemplate='<span class="text-sm text-outline">No visits recorded yet.</span>'
            />
          </CardBody>
        </Card>
      )}

      {showEdit && (
        <OffenderFormModal
          initial={offender}
          onClose={() => setShowEdit(false)}
          onSubmit={(values) => updateMutation.mutate(values)}
          isSubmitting={updateMutation.isPending}
        />
      )}
      {showAddCrime && (
        <CrimeFormModal
          offenderId={offenderId}
          onClose={() => setShowAddCrime(false)}
          onSubmit={(payload) => addCrimeMutation.mutate(payload)}
          isSubmitting={addCrimeMutation.isPending}
        />
      )}
      {showAddItem && (
        <InventoryFormModal
          offenderId={offenderId}
          crimes={crimesQuery.data ?? []}
          onClose={() => setShowAddItem(false)}
          onSubmit={(payload) => addItemMutation.mutate(payload)}
          isSubmitting={addItemMutation.isPending}
        />
      )}
      {showAddCondition && (
        <ParoleConditionFormModal
          offenderId={offenderId}
          onClose={() => setShowAddCondition(false)}
          onSubmit={(payload) => addConditionMutation.mutate(payload)}
          isSubmitting={addConditionMutation.isPending}
        />
      )}
      {incidentModal && (
        <IncidentFormModal
          offenderId={offenderId}
          title={incidentModal === "flag" ? "Flag violation" : "Log incident"}
          defaultStatus={incidentModal === "flag" ? "infraction" : "pending"}
          onClose={() => setIncidentModal(null)}
          onSubmit={(payload) => addIncidentMutation.mutate(payload)}
          isSubmitting={addIncidentMutation.isPending}
        />
      )}
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <p className="text-xs text-on-surface-variant">{label}</p>
      <p className="text-right font-data text-on-surface">{value}</p>
    </>
  );
}
