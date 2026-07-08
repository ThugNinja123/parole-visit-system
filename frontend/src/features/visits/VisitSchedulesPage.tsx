import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";

import { createVisitSchedule, fetchVisitSchedules, type VisitScheduleInput } from "@/api/visits";
import { PermissionGate } from "@/components/PermissionGate";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import type { VisitScheduleStatus } from "@/types";

import { VisitScheduleFormModal } from "@/features/visits/VisitScheduleFormModal";

const STATUS_TONE: Record<VisitScheduleStatus, "neutral" | "green" | "amber" | "red"> = {
  pending: "amber",
  completed: "green",
  missed: "red",
  cancelled: "neutral",
};

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
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-container-low text-label-md text-on-surface-variant">
            <tr>
              <th className="px-4 py-2">Offender</th>
              <th className="px-4 py-2">Assigned officer</th>
              <th className="px-4 py-2">Scheduled date</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {schedulesQuery.isLoading && (
              <tr>
                <td colSpan={4} className="py-8 text-center">
                  <Spinner />
                </td>
              </tr>
            )}
            {schedulesQuery.data?.results.map((schedule, index) => (
              <tr
                key={schedule.id}
                className={`${index % 2 === 1 ? "bg-surface-container-low/60" : ""} hover:bg-surface-container`}
              >
                <td className="px-4 py-2">
                  <Link
                    to={`/offenders/${schedule.offender}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {schedule.offender_name}
                  </Link>
                </td>
                <td className="px-4 py-2 text-on-surface-variant">{schedule.assigned_officer_name}</td>
                <td className="px-4 py-2 text-on-surface-variant">{schedule.scheduled_date}</td>
                <td className="px-4 py-2">
                  <Badge tone={STATUS_TONE[schedule.status]}>{schedule.status}</Badge>
                </td>
              </tr>
            ))}
            {schedulesQuery.data?.results.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-outline">
                  No visits scheduled yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
