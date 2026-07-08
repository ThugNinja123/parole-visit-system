import type { ComponentType } from "react";
import { NavLink, Outlet } from "react-router-dom";

import { HeaderBar } from "@/components/HeaderBar";
import { DashboardIcon, DirectoryIcon, FieldVisitIcon, ScheduleIcon, ShieldIcon } from "@/components/NavIcons";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";

interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  permission?: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Dashboard", icon: DashboardIcon, permission: "dashboard.view" },
  { to: "/offenders", label: "Offenders Directory", icon: DirectoryIcon, permission: "offender.view" },
  { to: "/visits", label: "Visit Schedules", icon: ScheduleIcon, permission: "visit.view" },
  { to: "/my-visits", label: "My Visits", icon: FieldVisitIcon, permission: "visit.submit" },
  { to: "/roles", label: "Roles & Access", icon: ShieldIcon, permission: "role.view" },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const { hasPermission } = usePermissions();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <aside className="flex w-60 flex-col border-r border-outline-variant bg-surface-container-lowest">
        <div className="border-b border-outline-variant px-5 py-4">
          <p className="text-sm font-semibold tracking-tight text-on-surface">Sentinel Command</p>
          <p className="text-label-md text-outline">Parole Visit Portal</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-2 py-4">
          {NAV_ITEMS.filter((item) => !item.permission || hasPermission(item.permission)).map(
            (item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 text-xs font-semibold tracking-wide transition-colors ${
                    isActive
                      ? "bg-secondary-container text-on-secondary-container"
                      : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                  }`
                }
              >
                <item.icon className="size-[18px] shrink-0" />
                {item.label}
              </NavLink>
            ),
          )}
        </nav>
        <div className="border-t border-outline-variant p-3">
          <div className="mb-2 rounded bg-surface-container-low px-3 py-2">
            <p className="truncate text-sm font-medium text-on-surface">
              {user?.first_name || user?.username}
            </p>
            <p className="truncate text-label-md text-outline">{user?.role_names.join(", ") || "No role"}</p>
          </div>
          <button
            onClick={logout}
            className="w-full rounded px-3 py-2 text-left text-sm font-medium text-on-surface-variant hover:bg-surface-container-low"
          >
            Log out
          </button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <HeaderBar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
