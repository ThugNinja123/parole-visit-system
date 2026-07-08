import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { fetchDistricts } from "@/api/geography";
import { createOffender, fetchOffenders, type OffenderFormValues } from "@/api/offenders";
import { PermissionGate } from "@/components/PermissionGate";
import {
  Badge,
  ComplianceBadge,
  complianceStatus,
  isHighRiskViolationRow,
  riskTone,
} from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";
import type { Offender, ParoleStatus, RiskLevel } from "@/types";

import { BulkUploadModal } from "@/features/offenders/BulkUploadModal";
import { OffenderFormModal } from "@/features/offenders/OffenderFormModal";

const PAGE_SIZE = 25;

function ChevronDownIcon() {
  return (
    <svg className="pointer-events-none absolute right-3 top-1/2 h-1.5 w-2 -translate-y-1/2" viewBox="0 0 7 5" fill="none" aria-hidden>
      <path d="M1 1l2.5 2.5L6 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg className="h-2 w-2.5" viewBox="0 0 11 7" fill="none" aria-hidden>
      <path d="M0 0.5h11M2 3.5h7M4 6.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function SortIcon() {
  return (
    <svg className="h-2.5 w-2.5 text-on-surface-variant" viewBox="0 0 11 11" fill="none" aria-hidden>
      <path d="M2 4l3.5 3.5L9 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ViewProfileIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 18 17" fill="none" aria-hidden>
      <circle cx="7" cy="5" r="3" stroke="currentColor" strokeWidth="1.3" />
      <path d="M1 15c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="13.5" cy="5.5" r="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M11 12.5c.9-.6 2.1-.9 3.5-.9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg className="h-3.5 w-1" viewBox="0 0 4 14" fill="currentColor" aria-hidden>
      <circle cx="2" cy="2" r="1.5" />
      <circle cx="2" cy="7" r="1.5" />
      <circle cx="2" cy="12" r="1.5" />
    </svg>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none border-outline-variant bg-surface-container-lowest py-2 pl-3 pr-9 text-body-sm text-on-surface"
        aria-label={label}
      >
        {children}
      </Select>
      <ChevronDownIcon />
    </div>
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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-headline-lg text-on-surface">Offender Directory</h1>
          <p className="text-body-sm text-on-surface-variant">
            Manage and monitor parolee assignments for {districtLabel}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            label="Risk level filter"
            value={riskLevel}
            onChange={updateRiskLevel}
          >
            <option value="">Risk Level: All</option>
            <option value="low">Risk Level: Low</option>
            <option value="medium">Risk Level: Medium</option>
            <option value="high">Risk Level: High</option>
          </FilterSelect>

          <FilterSelect label="District filter" value={district === "" ? "" : String(district)} onChange={updateDistrict}>
            <option value="">District: All</option>
            {districtsQuery.data?.map((d) => (
              <option key={d.id} value={d.id}>
                District: {d.name}
                {user?.police_station_name?.includes(d.name) ? " (Current)" : ""}
              </option>
            ))}
          </FilterSelect>

          <button
            type="button"
            onClick={() => setShowMoreFilters((open) => !open)}
            className="inline-flex items-center gap-2 border border-outline-variant bg-surface-container-lowest px-3 py-2 text-label-md text-on-surface transition-colors hover:bg-surface-container-low"
          >
            <FilterIcon />
            More Filters
          </button>

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

      {showMoreFilters && (
        <div className="flex flex-wrap items-center gap-3 rounded border border-outline-variant bg-surface-container-lowest p-4">
          <FilterSelect label="Parole status filter" value={status} onChange={updateStatus}>
            <option value="">Parole Status: All</option>
            <option value="active">Parole Status: Active</option>
            <option value="completed">Parole Status: Completed</option>
            <option value="absconded">Parole Status: Absconded</option>
          </FilterSelect>
        </div>
      )}

      <div className="overflow-hidden rounded border border-outline-variant bg-surface-container-lowest shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[800px] w-full text-left">
            <thead className="border-b border-outline-variant bg-background">
              <tr className="text-label-md text-on-surface-variant">
                <th className="px-4 py-3">
                  <span className="inline-flex items-center gap-1">
                    Name
                    <SortIcon />
                  </span>
                </th>
                <th className="w-[100px] px-4 py-3">ID #</th>
                <th className="w-[120px] px-4 py-3">Risk Level</th>
                <th className="w-[140px] px-4 py-3">Compliance</th>
                <th className="w-[207px] px-4 py-3">Next Visit</th>
                <th className="w-[80px] px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {offendersQuery.isLoading && (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Spinner />
                  </td>
                </tr>
              )}
              {results.map((offender) => {
                const compliance = complianceStatus(offender);
                const nextVisit = formatNextVisit(offender);
                const highlight = isHighRiskViolationRow(offender);

                return (
                  <tr
                    key={offender.id}
                    className={`border-t border-outline-variant ${
                      highlight ? "bg-error-container/10" : "hover:bg-surface-container-low/60"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {offender.offender_image ? (
                          <img
                            src={offender.offender_image}
                            alt=""
                            className="h-8 w-8 shrink-0 rounded-xl border border-outline-variant object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-outline-variant bg-surface-container font-data text-on-surface-variant">
                            {getInitials(offender.name)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <Link
                            to={`/offenders/${offender.id}`}
                            className="block truncate text-sm font-semibold text-on-surface hover:underline"
                          >
                            {offender.name}
                          </Link>
                          <p className="text-xs text-on-surface-variant">{formatDob(offender.date_of_birth)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-data text-on-surface-variant">{formatOffenderId(offender.id)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={riskTone(offender.risk_level)}>{capitalizeRisk(offender.risk_level)}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <ComplianceBadge tone={compliance.tone}>{compliance.label}</ComplianceBadge>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-data ${
                          nextVisit.urgent ? "font-semibold text-error" : "text-on-surface"
                        }`}
                      >
                        {nextVisit.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/offenders/${offender.id}`}
                          className="rounded p-1.5 text-on-surface transition-colors hover:bg-surface-container-low"
                          aria-label={`View ${offender.name}`}
                        >
                          <ViewProfileIcon />
                        </Link>
                        <button
                          type="button"
                          className="rounded p-1.5 text-on-surface transition-colors hover:bg-surface-container-low"
                          aria-label={`More actions for ${offender.name}`}
                        >
                          <MoreIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!offendersQuery.isLoading && results.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-body-sm text-outline">
                    No offenders match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant bg-background px-4 py-3">
          <p className="text-body-sm text-on-surface-variant">
            {total === 0
              ? "Showing 0 entries"
              : `Showing ${rangeStart} to ${rangeEnd} of ${total} entries`}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => p - 1)}
              disabled={!hasPrev}
              className="border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-label-md text-on-surface-variant transition-colors enabled:hover:bg-surface-container-low disabled:opacity-50"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNext}
              className="border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-label-md text-on-surface transition-colors enabled:hover:bg-surface-container-low disabled:opacity-50"
            >
              Next
            </button>
          </div>
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
