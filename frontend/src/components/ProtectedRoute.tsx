import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";

import { FullPageSpinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";

export function ProtectedRoute({
  children,
  requirePermission,
}: {
  children: ReactElement;
  requirePermission?: string;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const { hasPermission } = usePermissions();

  if (isLoading) return <FullPageSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requirePermission && !hasPermission(requirePermission)) {
    return (
      <div className="p-8 text-center text-on-surface-variant">
        You don't have permission to view this page.
      </div>
    );
  }
  return children;
}
