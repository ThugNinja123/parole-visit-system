import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { createVisitSchedule, fetchVisitSchedules, type VisitScheduleInput } from "@/api/visits";
import { DataGrid } from "@/components/DataGrid";
import { PermissionGate } from "@/components/PermissionGate";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { VisitSchedule, VisitScheduleStatus } from "@/types";

import { VisitScheduleFormModal } from "@/features/visits/VisitScheduleFormModal";

const STATUS_TONE: Record<VisitScheduleStatus, "neutral" | "green" | "amber" | "red"> = {
  pending: "amber",
  completed: "green",
  missed: "red",
  cancelled: "neutral",
};

function OffenderLinkRenderer({ data }: ICellRendererParams<VisitSchedule>) {
  if (!data) return null;
  return (
    <Link to={`/offenders/${data.offender}`} className="font-medium text-primary hover:underline">
      {data.offender_name}
    </Link>
  );
}

function StatusBadgeRenderer({ data }: ICellRendererParams<VisitSchedule>) {
  if (!data) return null;
  return <Badge tone={STATUS_TONE[data.status]}>{data.status}</Badge>;
}

export function VisitSchedulesPage() {
  const [showCreate, setShowCreate] = useState(false);
  const queryClient = useQueryClient();

  const schedulesQuery = useQuery({ queryKey: ["visit-schedules"], queryFn: () => fetchVisitSchedules() });

  const createMutation = useMutation({
    mutationFn: createVisitSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visit-schedules"] });
      setShowCreate(false);
    },
  });

  const columnDefs = useMemo<ColDef<VisitSchedule>[]>(
    () => [
      {
        headerName: "Offender",
        field: "offender_name",
        flex: 1,
        minWidth: 180,
        sortable: true,
        cellRenderer: OffenderLinkRenderer,
      },
      {
        headerName: "Assigned officer",
        field: "assigned_officer_name",
        flex: 1,
        minWidth: 160,
        sortable: true,
      },
      {
        headerName: "Scheduled date",
        field: "scheduled_date",
        width: 140,
        sortable: true,
        cellClass: "font-data text-on-surface-variant",
      },
      {
        headerName: "Status",
        field: "status",
        width: 120,
        sortable: true,
        cellRenderer: StatusBadgeRenderer,
      },
    ],
    [],
  );

  function handleCreate(payload: VisitScheduleInput) {
    createMutation.mutate(payload);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg text-on-surface">Visit Schedules</h1>
          <p className="text-body-sm text-on-surface-variant">Assign and track parole compliance visits.</p>
        </div>
        <PermissionGate code="visit.schedule">
          <Button onClick={() => setShowCreate(true)}>+ Schedule visit</Button>
        </PermissionGate>
      </div>

      <div className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest">
        <DataGrid<VisitSchedule>
          rowData={schedulesQuery.data?.results ?? []}
          columnDefs={columnDefs}
          rowHeight={44}
          headerHeight={40}
          loading={schedulesQuery.isLoading}
          overlayNoRowsTemplate='<span class="text-outline">No visits scheduled yet.</span>'
        />
      </div>

      {showCreate && (
        <VisitScheduleFormModal
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreate}
          isSubmitting={createMutation.isPending}
        />
      )}
    </div>
  );
}
