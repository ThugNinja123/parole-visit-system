import type { ReactNode } from "react";

import { usePermissions } from "@/hooks/usePermissions";

export function PermissionGate({
  code,
  children,
  fallback = null,
}: {
  code: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { hasPermission } = usePermissions();
  return hasPermission(code) ? <>{children}</> : <>{fallback}</>;
}
