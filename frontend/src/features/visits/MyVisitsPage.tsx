import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { fetchMySchedules } from "@/api/visits";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { FullPageSpinner } from "@/components/ui/Spinner";
import type { VisitSchedule } from "@/types";

import { VisitCaptureModal } from "@/features/visits/VisitCaptureModal";

export function MyVisitsPage() {
  const [activeSchedule, setActiveSchedule] = useState<VisitSchedule | null>(null);
  const queryClient = useQueryClient();

  const schedulesQuery = useQuery({ queryKey: ["visit-schedules", "mine"], queryFn: fetchMySchedules });

  if (schedulesQuery.isLoading) return <FullPageSpinner />;

  const pending = schedulesQuery.data?.results.filter((s) => s.status === "pending") ?? [];
  const others = schedulesQuery.data?.results.filter((s) => s.status !== "pending") ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-headline-lg text-on-surface">My Visits</h1>
        <p className="text-body-sm text-on-surface-variant">
          Visits assigned to you. Capture GPS + photo on arrival.
        </p>
      </div>

      <div className="space-y-3">
        {pending.length === 0 && (
          <p className="text-sm text-outline">No pending visits assigned to you.</p>
        )}
        {pending.map((schedule) => (
          <Card key={schedule.id}>
            <CardBody className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-on-surface">{schedule.offender_name}</p>
                <p className="text-xs text-on-surface-variant">Scheduled for {schedule.scheduled_date}</p>
                {schedule.notes && <p className="mt-1 text-xs text-outline">{schedule.notes}</p>}
              </div>
              <Button onClick={() => setActiveSchedule(schedule)}>Record visit</Button>
            </CardBody>
          </Card>
        ))}
      </div>

      {others.length > 0 && (
        <div>
          <h2 className="mb-2 text-headline-md text-on-surface">Past visits</h2>
          <div className="space-y-2">
            {others.map((schedule) => (
              <div
                key={schedule.id}
                className="flex items-center justify-between rounded border border-outline-variant bg-surface-container-lowest px-4 py-3"
              >
                <p className="text-sm text-on-surface-variant">
                  {schedule.offender_name} - {schedule.scheduled_date}
                </p>
                <Badge tone={schedule.status === "completed" ? "green" : "neutral"}>{schedule.status}</Badge>
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
