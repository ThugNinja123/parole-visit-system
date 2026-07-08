import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { fetchOffenders } from "@/api/offenders";
import { fetchFlaggedVisits } from "@/api/visits";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { FullPageSpinner } from "@/components/ui/Spinner";

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card>
      <CardBody>
        <p className="text-label-md text-on-surface-variant">{label}</p>
        <p className="mt-1 font-data text-2xl text-on-surface">{value}</p>
      </CardBody>
    </Card>
  );
}

export function DashboardPage() {
  const flaggedQuery = useQuery({ queryKey: ["visits", "flagged"], queryFn: fetchFlaggedVisits });
  const offendersQuery = useQuery({
    queryKey: ["offenders", "dashboard-stats"],
    queryFn: () => fetchOffenders({ page: 1 }),
  });
  const highRiskQuery = useQuery({
    queryKey: ["offenders", "risk", "high"],
    queryFn: () => fetchOffenders({ risk_level: "high" }),
  });

  if (flaggedQuery.isLoading || offendersQuery.isLoading || highRiskQuery.isLoading) {
    return <FullPageSpinner />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-headline-lg text-on-surface">Dashboard</h1>
        <p className="text-body-sm text-on-surface-variant">
          Overview of caseload and field verification status.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Active offenders" value={offendersQuery.data?.count ?? 0} />
        <StatCard label="High risk offenders" value={highRiskQuery.data?.count ?? 0} />
        <StatCard label="Flagged visits awaiting review" value={flaggedQuery.data?.count ?? 0} />
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-headline-md text-on-surface">Flagged visits - review queue</h2>
        </CardHeader>
        <CardBody className="space-y-3">
          {flaggedQuery.data?.results.length === 0 && (
            <p className="text-body-sm text-on-surface-variant">No flagged visits. Everything checks out.</p>
          )}
          {flaggedQuery.data?.results.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between rounded border border-outline-variant px-4 py-3"
            >
              <div>
                <Link
                  to={`/offenders/${record.offender}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {record.offender_name}
                </Link>
                <p className="text-xs text-on-surface-variant">
                  Visited by {record.officer_name} on {new Date(record.visited_at).toLocaleString()} -{" "}
                  <span className="font-data">{Math.round(record.distance_meters)}m</span> from registered
                  address
                </p>
              </div>
              <Badge tone="red">Flagged</Badge>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
