import { useQuery } from "@tanstack/react-query";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { useMemo } from "react";
import { Link } from "react-router-dom";

import { fetchOffenders } from "@/api/offenders";
import { fetchFlaggedVisits } from "@/api/visits";
import { DataGrid } from "@/components/DataGrid";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { FullPageSpinner } from "@/components/ui/Spinner";
import type { VisitRecord } from "@/types";

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

function OffenderLinkRenderer({ data }: ICellRendererParams<VisitRecord>) {
  if (!data) return null;
  return (
    <Link to={`/offenders/${data.offender}`} className="text-sm font-medium text-primary hover:underline">
      {data.offender_name}
    </Link>
  );
}

function FlaggedBadgeRenderer() {
  return <Badge tone="red">Flagged</Badge>;
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

  const flaggedColumnDefs = useMemo<ColDef<VisitRecord>[]>(
    () => [
      {
        headerName: "Offender",
        field: "offender_name",
        flex: 1,
        minWidth: 160,
        sortable: true,
        cellRenderer: OffenderLinkRenderer,
      },
      {
        headerName: "Officer",
        field: "officer_name",
        width: 140,
        sortable: true,
      },
      {
        headerName: "Visited at",
        field: "visited_at",
        width: 180,
        sortable: true,
        valueFormatter: ({ value }) => (value ? new Date(value as string).toLocaleString() : ""),
      },
      {
        headerName: "Distance",
        field: "distance_meters",
        width: 110,
        sortable: true,
        valueFormatter: ({ value }) => `${Math.round(value as number)}m`,
        cellClass: "font-data",
      },
      {
        headerName: "Status",
        width: 100,
        sortable: false,
        cellRenderer: FlaggedBadgeRenderer,
      },
    ],
    [],
  );

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
        <CardBody>
          <DataGrid<VisitRecord>
            rowData={flaggedQuery.data?.results ?? []}
            columnDefs={flaggedColumnDefs}
            rowHeight={44}
            headerHeight={40}
            overlayNoRowsTemplate='<span class="text-body-sm text-on-surface-variant">No flagged visits. Everything checks out.</span>'
          />
        </CardBody>
      </Card>
    </div>
  );
}
