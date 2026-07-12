import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { ListFilter, MoreVertical, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { fetchDistricts } from "@/api/geography";
import { createOffender, fetchOffenders, type OffenderFormValues } from "@/api/offenders";
import { DataGrid } from "@/components/DataGrid";
import { PermissionGate } from "@/components/PermissionGate";
import {
  Badge,
  ComplianceBadge,
  complianceStatus,
  isHighRiskViolationRow,
  riskTone,
} from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Select, type SelectOption } from "@/components/ui/Select";
import { useAuth } from "@/hooks/useAuth";
import type { Offender, ParoleStatus, RiskLevel } from "@/types";

import { BulkUploadModal } from "@/features/offenders/BulkUploadModal";
import { OffenderFormModal } from "@/features/offenders/OffenderFormModal";

const PAGE_SIZE = 25;

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
}) {
  return (
    <Select
      aria-label={label}
      value={value}
      onValueChange={onChange}
      options={options}
      className="min-w-[160px] text-body-sm"
    />
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatOffenderId(id: number): string {
  return `#P-${String(id).padStart(5, "0")}`;
}

function formatDob(dateOfBirth: string | null): string {
  if (!dateOfBirth) return "DOB: Unknown";
  const date = new Date(dateOfBirth);
  if (Number.isNaN(date.getTime())) return "DOB: Unknown";
  return `DOB: ${date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}`;
}

function formatNextVisit(offender: Offender): { label: string; urgent: boolean } {
  if (!offender.last_visit) {
    return { label: "Not scheduled", urgent: false };
  }
  const visitedAt = new Date(offender.last_visit.visited_at);
  const today = new Date();
  const isToday =
    visitedAt.getFullYear() === today.getFullYear() &&
    visitedAt.getMonth() === today.getMonth() &&
    visitedAt.getDate() === today.getDate();

  if (isToday) {
    return {
      label: `Today, ${visitedAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}`,
      urgent: offender.last_visit.location_status === "flagged",
    };
  }

  return {
    label: visitedAt.toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    urgent: false,
  };
}

function capitalizeRisk(risk: RiskLevel): string {
  return risk.charAt(0).toUpperCase() + risk.slice(1);
}

function NameCellRenderer({ data }: ICellRendererParams<Offender>) {
  if (!data) return null;

  return (
    <div className="flex h-full items-center gap-3">
      {data.offender_image ? (
        <img
          src={data.offender_image}
          alt=""
          className="h-8 w-8 shrink-0 rounded-xl border border-outline-variant object-cover"
        />
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-outline-variant bg-surface-container font-data text-on-surface-variant">
          {getInitials(data.name)}
        </div>
      )}
      <div className="min-w-0">
        <Link
          to={`/offenders/${data.id}`}
          className="block truncate text-sm font-semibold text-on-surface hover:underline"
        >
          {data.name}
        </Link>
        <p className="text-xs text-on-surface-variant">{formatDob(data.date_of_birth)}</p>
      </div>
    </div>
  );
}

function OffenderIdCellRenderer({ data }: ICellRendererParams<Offender>) {
  if (!data) return null;
  return <span className="font-data text-on-surface-variant">{formatOffenderId(data.id)}</span>;
}

function RiskLevelCellRenderer({ data }: ICellRendererParams<Offender>) {
  if (!data) return null;
  return <Badge tone={riskTone(data.risk_level)}>{capitalizeRisk(data.risk_level)}</Badge>;
}

function ComplianceCellRenderer({ data }: ICellRendererParams<Offender>) {
  if (!data) return null;
  const compliance = complianceStatus(data);
  return <ComplianceBadge tone={compliance.tone}>{compliance.label}</ComplianceBadge>;
}

function NextVisitCellRenderer({ data }: ICellRendererParams<Offender>) {
  if (!data) return null;
  const nextVisit = formatNextVisit(data);
  return (
    <span className={`font-data ${nextVisit.urgent ? "font-semibold text-error" : "text-on-surface"}`}>
      {nextVisit.label}
    </span>
  );
}

function ActionsCellRenderer({ data }: ICellRendererParams<Offender>) {
  if (!data) return null;

  return (
    <div className="flex h-full items-center justify-end gap-1">
      <Link
        to={`/offenders/${data.id}`}
        className="rounded p-1.5 text-on-surface transition-colors hover:bg-surface-container-low"
        aria-label={`View ${data.name}`}
      >
        <UserRound className="h-4 w-4" aria-hidden />
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="rounded p-1.5 text-on-surface transition-colors hover:bg-surface-container-low"
          aria-label={`More actions for ${data.name}`}
        >
          <MoreVertical className="h-4 w-4" aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem render={<Link to={`/offenders/${data.id}`} />}>
            <UserRound className="h-4 w-4" aria-hidden />
            View profile
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function OffenderMobileCard({ offender }: { offender: Offender }) {
  const compliance = complianceStatus(offender);
  const nextVisit = formatNextVisit(offender);

  return (
    <Link
      to={`/offenders/${offender.id}`}
      className="block rounded border border-outline-variant bg-surface-container-lowest p-3 shadow-sm"
    >
      <div className="flex items-center gap-3">
        {offender.offender_image ? (
          <img
            src={offender.offender_image}
            alt=""
            className="h-10 w-10 shrink-0 rounded-xl border border-outline-variant object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-outline-variant bg-surface-container font-data text-on-surface-variant">
            {getInitials(offender.name)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-on-surface">{offender.name}</p>
          <p className="font-data text-xs text-on-surface-variant">{formatOffenderId(offender.id)}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge tone={riskTone(offender.risk_level)}>{capitalizeRisk(offender.risk_level)}</Badge>
        <ComplianceBadge tone={compliance.tone}>{compliance.label}</ComplianceBadge>
      </div>
      <p className="mt-2 text-xs text-on-surface-variant">
        Next visit:{" "}
        <span className={`font-data ${nextVisit.urgent ? "font-semibold text-error" : "text-on-surface"}`}>
          {nextVisit.label}
        </span>
      </p>
    </Link>
  );
}

export function OffendersListPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const [riskLevel, setRiskLevel] = useState<RiskLevel | "">("");
  const [district, setDistrict] = useState<number | "">("");
  const [status, setStatus] = useState<ParoleStatus | "">("");
  const [page, setPage] = useState(1);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const queryClient = useQueryClient();

  const districtsQuery = useQuery({ queryKey: ["districts"], queryFn: fetchDistricts });

  const offendersQuery = useQuery({
    queryKey: ["offenders", { search, riskLevel, status, district, page }],
    queryFn: () =>
      fetchOffenders({
        search: search || undefined,
        risk_level: riskLevel || undefined,
        parole_status: status || undefined,
        district: district || undefined,
        page,
      }),
  });

  const createMutation = useMutation({
    mutationFn: createOffender,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offenders"] });
      setShowCreate(false);
    },
  });

  const total = offendersQuery.data?.count ?? 0;
  const results = offendersQuery.data?.results ?? [];
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);
  const hasPrev = page > 1;
  const hasNext = Boolean(offendersQuery.data?.next);

  const selectedDistrict = districtsQuery.data?.find((d) => d.id === district);
  const districtLabel = selectedDistrict?.name ?? user?.police_station_name?.split(" ")[0] ?? "All";

  const columnDefs = useMemo<ColDef<Offender>[]>(
    () => [
      {
        colId: "name",
        headerName: "Name",
        field: "name",
        flex: 1,
        minWidth: 280,
        sortable: true,
        cellRenderer: NameCellRenderer,
      },
      {
        colId: "id",
        headerName: "ID #",
        width: 100,
        sortable: true,
        valueGetter: ({ data }) => (data ? formatOffenderId(data.id) : ""),
        cellRenderer: OffenderIdCellRenderer,
      },
      {
        colId: "risk_level",
        headerName: "Risk Level",
        field: "risk_level",
        width: 120,
        sortable: true,
        cellRenderer: RiskLevelCellRenderer,
      },
      {
        colId: "compliance",
        headerName: "Compliance",
        width: 140,
        sortable: false,
        cellRenderer: ComplianceCellRenderer,
      },
      {
        colId: "next_visit",
        headerName: "Next Visit",
        width: 207,
        sortable: false,
        cellRenderer: NextVisitCellRenderer,
      },
      {
        colId: "actions",
        headerName: "Actions",
        width: 80,
        sortable: false,
        resizable: false,
        cellRenderer: ActionsCellRenderer,
      },
    ],
    [],
  );

  const defaultColDef = useMemo<ColDef<Offender>>(
    () => ({
      filter: false,
      resizable: true,
      suppressMovable: true,
    }),
    [],
  );

  function updateRiskLevel(value: string) {
    setRiskLevel(value as RiskLevel | "");
    setPage(1);
  }

  function updateDistrict(value: string) {
    setDistrict(value ? Number(value) : "");
    setPage(1);
  }

  function updateStatus(value: string) {
    setStatus(value as ParoleStatus | "");
    setPage(1);
  }

  function handleCreate(values: OffenderFormValues) {
    createMutation.mutate(values);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-headline-lg text-on-surface">Offender Directory</h1>
          <p className="text-body-sm text-on-surface-variant">
            Manage and monitor parolee assignments for {districtLabel}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <PermissionGate code="offender.create">
            <Button variant="secondary" onClick={() => setShowBulkUpload(true)}>
              Bulk upload
            </Button>
          </PermissionGate>

          <PermissionGate code="offender.create">
            <Button onClick={() => setShowCreate(true)}>+ Register offender</Button>
          </PermissionGate>
        </div>
      </div>

      <div className="rounded border border-outline-variant bg-surface-container-lowest p-4">
        <div className="flex flex-wrap items-center gap-3">
          <FilterSelect
            label="Risk level filter"
            value={riskLevel}
            onChange={updateRiskLevel}
            options={[
              { value: "", label: "Risk Level: All" },
              { value: "low", label: "Risk Level: Low" },
              { value: "medium", label: "Risk Level: Medium" },
              { value: "high", label: "Risk Level: High" },
            ]}
          />

          <FilterSelect
            label="District filter"
            value={district === "" ? "" : String(district)}
            onChange={updateDistrict}
            options={[
              { value: "", label: "District: All" },
              ...(districtsQuery.data?.map((d) => ({
                value: String(d.id),
                label: `District: ${d.name}${user?.police_station_name?.includes(d.name) ? " (Current)" : ""}`,
              })) ?? []),
            ]}
          />

          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowMoreFilters((open) => !open)}
            className="text-label-md"
          >
            <ListFilter className="h-3.5 w-3.5" aria-hidden />
            More Filters
          </Button>
        </div>

        {showMoreFilters && (
          <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-outline-variant pt-3">
            <FilterSelect
              label="Parole status filter"
              value={status}
              onChange={updateStatus}
              options={[
                { value: "", label: "Parole Status: All" },
                { value: "active", label: "Parole Status: Active" },
                { value: "completed", label: "Parole Status: Completed" },
                { value: "absconded", label: "Parole Status: Absconded" },
              ]}
            />
          </div>
        )}
      </div>

      <div className="space-y-3 md:hidden">
        {results.length === 0 ? (
          <p className="rounded border border-outline-variant bg-surface-container-lowest p-4 text-body-sm text-outline">
            {offendersQuery.isLoading ? "Loading offenders..." : "No offenders match these filters."}
          </p>
        ) : (
          results.map((offender) => <OffenderMobileCard key={offender.id} offender={offender} />)
        )}
      </div>

      <div className="hidden overflow-hidden rounded border border-outline-variant bg-surface-container-lowest shadow-sm md:block">
        <div className="w-full">
          <DataGrid<Offender>
            rowData={results}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            rowHeight={64}
            headerHeight={44}
            loading={offendersQuery.isLoading}
            overlayNoRowsTemplate='<span class="text-body-sm text-outline">No offenders match these filters.</span>'
            rowClassRules={{
              "offender-row-highlight": (params) =>
                params.data ? isHighRiskViolationRow(params.data) : false,
            }}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-outline-variant bg-background px-4 py-3">
          <p className="text-body-sm text-on-surface-variant">
            {total === 0
              ? "Showing 0 entries"
              : `Showing ${rangeStart} to ${rangeEnd} of ${total} entries`}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={!hasPrev}
              className="text-label-md text-on-surface-variant"
            >
              Prev
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNext}
              className="text-label-md"
            >
              Next
            </Button>
          </div>
        </div>
      {showCreate && (
        <OffenderFormModal
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreate}
          isSubmitting={createMutation.isPending}
        />
      )}
      {showBulkUpload && <BulkUploadModal onClose={() => setShowBulkUpload(false)} />}
    </div>
  );
}
