import { useAuth } from "@/hooks/useAuth";

export function usePermissions() {
  const { user, hasPermission } = useAuth();
  return { permissions: user?.permissions ?? [], hasPermission };
}
