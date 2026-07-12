import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { useMemo, useState } from "react";

import { fetchMySchedules } from "@/api/visits";
import { DataGrid } from "@/components/DataGrid";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FullPageSpinner } from "@/components/ui/Spinner";
import type { VisitSchedule, VisitScheduleStatus } from "@/types";

import { VisitCaptureModal } from "@/features/visits/VisitCaptureModal";

const STATUS_TONE: Record<VisitScheduleStatus, "neutral" | "green" | "amber" | "red"> = {
  pending: "amber",
  completed: "green",
  missed: "red",
  cancelled: "neutral",
};

interface PendingVisitsContext {
  onRecordVisit: (schedule: VisitSchedule) => void;
}

function PendingActionsRenderer({
  data,
  context,
}: ICellRendererParams<VisitSchedule, unknown, PendingVisitsContext>) {
  if (!data) return null;
  return (
    <div className="flex h-full items-center justify-end">
      <Button onClick={() => context.onRecordVisit(data)}>Record visit</Button>
    </div>
  );
}

function StatusBadgeRenderer({ data }: ICellRendererParams<VisitSchedule>) {
  if (!data) return null;
  return <Badge tone={STATUS_TONE[data.status]}>{data.status}</Badge>;
}

export function MyVisitsPage() {
  const [activeSchedule, setActiveSchedule] = useState<VisitSchedule | null>(null);
  const queryClient = useQueryClient();

  const schedulesQuery = useQuery({ queryKey: ["visit-schedules", "mine"], queryFn: fetchMySchedules });

  const pending = schedulesQuery.data?.results.filter((s) => s.status === "pending") ?? [];
  const others = schedulesQuery.data?.results.filter((s) => s.status !== "pending") ?? [];

  const pendingColumnDefs = useMemo<ColDef<VisitSchedule>[]>(
    () => [
      {
        headerName: "Offender",
        field: "offender_name",
        flex: 1,
        minWidth: 160,
        sortable: true,
      },
      {
        headerName: "Scheduled date",
        field: "scheduled_date",
        width: 140,
        sortable: true,
        cellClass: "text-on-surface-variant",
      },
      {
        headerName: "Notes",
        field: "notes",
        flex: 1,
        minWidth: 160,
        wrapText: true,
        autoHeight: true,
        cellClass: "text-outline",
      },
      {
        headerName: "Actions",
        width: 140,
        sortable: false,
        resizable: false,
        cellRenderer: PendingActionsRenderer,
      },
    ],
    [],
  );

  const pastColumnDefs = useMemo<ColDef<VisitSchedule>[]>(
    () => [
      {
        headerName: "Offender",
        field: "offender_name",
        flex: 1,
        minWidth: 160,
        sortable: true,
        cellClass: "text-on-surface-variant",
      },
      {
        headerName: "Scheduled date",
        field: "scheduled_date",
        width: 140,
        sortable: true,
        cellClass: "text-on-surface-variant",
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

  const gridContext = useMemo<PendingVisitsContext>(
    () => ({ onRecordVisit: setActiveSchedule }),
    [],
  );

  if (schedulesQuery.isLoading) return <FullPageSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-headline-lg text-on-surface">My Visits</h1>
        <p className="text-body-sm text-on-surface-variant">
          Visits assigned to you. Capture GPS + photo on arrival.
        </p>
      </div>

      <div className="hidden md:block">
        <DataGrid<VisitSchedule>
          rowData={pending}
          columnDefs={pendingColumnDefs}
          context={gridContext}
          rowHeight={52}
          headerHeight={40}
          overlayNoRowsTemplate='<span class="text-sm text-outline">No pending visits assigned to you.</span>'
        />
      </div>

      <div className="space-y-3 md:hidden">
        {pending.length === 0 ? (
          <p className="rounded border border-outline-variant bg-surface-container-lowest p-4 text-body-sm text-outline">
            No pending visits assigned to you.
          </p>
        ) : (
          pending.map((schedule) => (
            <div
              key={schedule.id}
              className="rounded border border-outline-variant bg-surface-container-lowest p-3 shadow-sm"
            >
              <p className="text-sm font-semibold text-on-surface">{schedule.offender_name}</p>
              <p className="mt-1 text-xs text-on-surface-variant">
                Scheduled: {schedule.scheduled_date}
              </p>
              {schedule.notes && <p className="mt-1 text-xs text-outline">{schedule.notes}</p>}
              <Button className="mt-3 w-full" onClick={() => setActiveSchedule(schedule)}>
                Record visit
              </Button>
            </div>
          ))
        )}
      </div>

      {others.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-headline-md text-on-surface">Past visits</h2>
          <div className="hidden overflow-hidden rounded border border-outline-variant bg-surface-container-lowest md:block">
            <DataGrid<VisitSchedule>
              rowData={others}
              columnDefs={pastColumnDefs}
              rowHeight={44}
              headerHeight={40}
            />
          </div>
          <div className="space-y-3 md:hidden">
            {others.map((schedule) => (
              <div
                key={schedule.id}
                className="flex items-center justify-between gap-3 rounded border border-outline-variant bg-surface-container-lowest p-3 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-on-surface">
                    {schedule.offender_name}
                  </p>
                  <p className="mt-1 text-xs text-on-surface-variant">{schedule.scheduled_date}</p>
                </div>
                <Badge tone={STATUS_TONE[schedule.status]}>{schedule.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSchedule && (
        <VisitCaptureModal
          schedule={activeSchedule}
          onClose={() => setActiveSchedule(null)}
          onSubmitted={() => {
            queryClient.invalidateQueries({ queryKey: ["visit-schedules", "mine"] });
          }}
        />
      )}
    </div>
  );
}
