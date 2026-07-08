import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import type { EyeColor, VisitType } from "@/types";

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
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? "border-b-2 border-primary text-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {t.label}
          </button>
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
                          <button
                            onClick={() => deleteConditionMutation.mutate(condition.id)}
                            className="text-xs text-outline hover:text-error"
                            aria-label="Remove condition"
                          >
                            ✕
                          </button>
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
                  {recentIncidents.length === 0 ? (
                    <p className="mt-2 text-sm text-outline">No incidents recorded.</p>
                  ) : (
                    <table className="mt-1 w-full text-left text-sm">
                      <thead>
                        <tr className="bg-surface">
                          <th className="px-1 py-2 text-xs font-semibold tracking-wide text-on-surface-variant">
                            Date
                          </th>
                          <th className="px-1 py-2 text-xs font-semibold tracking-wide text-on-surface-variant">
                            Type
                          </th>
                          <th className="px-1 py-2 text-xs font-semibold tracking-wide text-on-surface-variant">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentIncidents.map((incident) => (
                          <tr key={incident.id} className="border-t border-outline-variant">
                            <td className="px-1 py-2 font-data text-on-surface">{incident.date}</td>
                            <td className="px-1 py-2 capitalize text-on-surface">
                              {incident.incident_type.replace("_", " ")}
                            </td>
                            <td className="px-1 py-2">
                              <Badge tone={incidentStatusTone(incident.status)}>{incident.status}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
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
                  <button
                    onClick={() => setTab("visits")}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    View all
                  </button>
                </div>
                {recentVisits.length === 0 ? (
                  <p className="text-sm text-outline">No visits recorded yet.</p>
                ) : (
                  <div className="space-y-4">
                    {recentVisits.map((record, index) => (
                      <div
                        key={record.id}
                        className={`border-l-2 py-0.5 pl-4 ${
                          index === 0 ? "border-primary" : "border-outline-variant"
                        }`}
                      >
                        <p className="text-xs text-on-surface-variant">
                          {new Date(record.visited_at).toLocaleDateString()} &bull;{" "}
                          {new Date(record.visited_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="text-label-md text-primary">{VISIT_TYPE_LABELS[record.visit_type]}</p>
                        {record.remarks && (
                          <p className="mt-0.5 text-sm text-on-surface">{record.remarks}</p>
                        )}
                        <p className="mt-0.5 text-xs text-outline">Officer {record.officer_name}</p>
                      </div>
                    ))}
                  </div>
                )}
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
          <CardBody className="space-y-3">
            {crimesQuery.data?.length === 0 && (
              <p className="text-sm text-outline">No crimes recorded.</p>
            )}
            {crimesQuery.data?.map((crime) => (
              <div key={crime.id} className="rounded border border-outline-variant px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium capitalize text-on-surface">
                    {crime.crime_type.replace("_", " ")}
                  </p>
                  <p className="text-xs text-outline">{crime.date_committed ?? "Date unknown"}</p>
                </div>
                {crime.case_number && (
                  <p className="font-data text-xs text-on-surface-variant">Case #{crime.case_number}</p>
                )}
                {crime.description && (
                  <p className="mt-1 text-sm text-on-surface-variant">{crime.description}</p>
                )}
              </div>
            ))}
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
          <CardBody className="space-y-3">
            {inventoryQuery.data?.length === 0 && (
              <p className="text-sm text-outline">No inventory items recorded.</p>
            )}
            {inventoryQuery.data?.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded border border-outline-variant px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium capitalize text-on-surface">
                    {item.item_type}: {item.description}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {item.quantity && `${item.quantity} - `}Stored at {item.storage_location}
                  </p>
                </div>
                <Badge tone={item.status === "in_custody" ? "blue" : "neutral"}>
                  {item.status.replace("_", " ")}
                </Badge>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {tab === "visits" && (
        <Card>
          <CardHeader>
            <h2 className="text-headline-md text-on-surface">Visit history</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            {visitsQuery.data?.results.length === 0 && (
              <p className="text-sm text-outline">No visits recorded yet.</p>
            )}
            {visitsQuery.data?.results.map((record) => (
              <div key={record.id} className="rounded border border-outline-variant px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-on-surface">
                    {new Date(record.visited_at).toLocaleString()} - {record.officer_name}
                  </p>
                  <Badge tone={locationStatusTone(record.location_status)}>
                    {record.location_status} ({Math.round(record.distance_meters)}m)
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-outline">{VISIT_TYPE_LABELS[record.visit_type]}</p>
                {record.remarks && <p className="mt-1 text-sm text-on-surface-variant">{record.remarks}</p>}
              </div>
            ))}
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
