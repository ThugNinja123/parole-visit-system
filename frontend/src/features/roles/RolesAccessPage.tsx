import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { createRole, createUser, deleteRole, fetchRoles, fetchUsers, updateRole, updateUser } from "@/api/roles";
import { DataGrid } from "@/components/DataGrid";
import { PermissionGate } from "@/components/PermissionGate";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { FullPageSpinner } from "@/components/ui/Spinner";
import type { AppUser, Role } from "@/types";

import { RoleFormModal } from "@/features/roles/RoleFormModal";
import { UserFormModal } from "@/features/roles/UserFormModal";

interface RoleGridContext {
  onEdit: (role: Role) => void;
  onDelete: (id: number) => void;
}

interface UserGridContext {
  onEdit: (user: AppUser) => void;
}

function RoleNameRenderer({ data }: ICellRendererParams<Role>) {
  if (!data) return null;
  return (
    <div className="py-1">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-on-surface">{data.name}</p>
        {data.is_system && <Badge tone="neutral">system</Badge>}
        <Badge tone="blue">{data.user_count} users</Badge>
      </div>
      <p className="text-xs text-on-surface-variant">{data.description}</p>
      <p className="mt-1 text-xs text-outline">{data.permissions.length} permissions granted</p>
    </div>
  );
}

function RoleActionsRenderer({ data, context }: ICellRendererParams<Role, unknown, RoleGridContext>) {
  if (!data) return null;
  return (
    <PermissionGate code="role.manage">
      <div className="flex h-full items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Edit ${data.name}`}
          onClick={() => context.onEdit(data)}
        >
          <Pencil className="h-4 w-4" aria-hidden />
        </Button>
        {!data.is_system && (
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${data.name}`}
            className="text-error hover:bg-error-container hover:text-on-error-container"
            onClick={() => context.onDelete(data.id)}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </Button>
        )}
      </div>
    </PermissionGate>
  );
}

function UserNameRenderer({ data }: ICellRendererParams<AppUser>) {
  if (!data) return null;
  return (
    <div className="py-1">
      <p className="text-sm font-medium text-on-surface">
        {data.first_name} {data.last_name} ({data.username})
      </p>
      <p className="text-xs text-on-surface-variant">
        {data.police_station_name ?? "Unassigned station"} - {data.role_names.join(", ") || "No role"}
      </p>
    </div>
  );
}

function UserActionsRenderer({ data, context }: ICellRendererParams<AppUser, unknown, UserGridContext>) {
  if (!data) return null;
  return (
    <PermissionGate code="user.manage">
      <div className="flex h-full items-center justify-end">
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Edit ${data.username}`}
          onClick={() => context.onEdit(data)}
        >
          <Pencil className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </PermissionGate>
  );
}

export function RolesAccessPage() {
  const [tab, setTab] = useState<"roles" | "users">("roles");
  const [editingRole, setEditingRole] = useState<Role | "new" | null>(null);
  const [editingUser, setEditingUser] = useState<AppUser | "new" | null>(null);
  const queryClient = useQueryClient();

  const rolesQuery = useQuery({ queryKey: ["roles"], queryFn: fetchRoles });
  const usersQuery = useQuery({ queryKey: ["users"], queryFn: fetchUsers, enabled: tab === "users" });

  const saveRoleMutation = useMutation({
    mutationFn: (payload: Parameters<typeof createRole>[0]) =>
      editingRole && editingRole !== "new" ? updateRole(editingRole.id, payload) : createRole(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setEditingRole(null);
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roles"] }),
  });

  const saveUserMutation = useMutation({
    mutationFn: (payload: Parameters<typeof createUser>[0]) =>
      editingUser && editingUser !== "new" ? updateUser(editingUser.id, payload) : createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditingUser(null);
    },
  });

  const roleColumnDefs = useMemo<ColDef<Role>[]>(
    () => [
      {
        headerName: "Role",
        field: "name",
        flex: 1,
        minWidth: 280,
        sortable: true,
        cellRenderer: RoleNameRenderer,
        autoHeight: true,
      },
      {
        headerName: "Actions",
        width: 180,
        sortable: false,
        resizable: false,
        cellRenderer: RoleActionsRenderer,
      },
    ],
    [],
  );

  const userColumnDefs = useMemo<ColDef<AppUser>[]>(
    () => [
      {
        headerName: "User",
        field: "username",
        flex: 1,
        minWidth: 280,
        sortable: true,
        cellRenderer: UserNameRenderer,
        autoHeight: true,
      },
      {
        headerName: "Actions",
        width: 100,
        sortable: false,
        resizable: false,
        cellRenderer: UserActionsRenderer,
      },
    ],
    [],
  );

  const roleGridContext = useMemo<RoleGridContext>(
    () => ({
      onEdit: setEditingRole,
      onDelete: (id) => deleteRoleMutation.mutate(id),
    }),
    [deleteRoleMutation],
  );

  const userGridContext = useMemo<UserGridContext>(() => ({ onEdit: setEditingUser }), []);

  if (rolesQuery.isLoading) return <FullPageSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-headline-lg text-on-surface">Roles & Access</h1>
        <p className="text-body-sm text-on-surface-variant">
          Manage roles, granular permissions, and which users hold each role.
        </p>
      </div>

      <div className="flex gap-1 border-b border-outline-variant">
        {(["roles", "users"] as const).map((key) => (
          <Button
            key={key}
            type="button"
            variant="ghost"
            onClick={() => setTab(key)}
            className={`rounded-none px-4 py-2 capitalize ${
              tab === key
                ? "border-b-2 border-primary text-primary hover:bg-transparent"
                : "text-on-surface-variant"
            }`}
          >
            {key}
          </Button>
        ))}
      </div>

      {tab === "roles" && (
        <Card>
          <CardHeader>
            <h2 className="text-headline-md text-on-surface">Roles</h2>
            <PermissionGate code="role.manage">
              <Button onClick={() => setEditingRole("new")}>+ Create role</Button>
            </PermissionGate>
          </CardHeader>
          <CardBody>
            <DataGrid<Role>
              rowData={rolesQuery.data ?? []}
              columnDefs={roleColumnDefs}
              context={roleGridContext}
              rowHeight={72}
              headerHeight={40}
            />
          </CardBody>
        </Card>
      )}

      {tab === "users" && (
        <Card>
          <CardHeader>
            <h2 className="text-headline-md text-on-surface">Users</h2>
            <PermissionGate code="user.manage">
              <Button onClick={() => setEditingUser("new")}>+ Create user</Button>
            </PermissionGate>
          </CardHeader>
          <CardBody>
            {usersQuery.isLoading ? (
              <FullPageSpinner />
            ) : (
              <DataGrid<AppUser>
                rowData={usersQuery.data ?? []}
                columnDefs={userColumnDefs}
                context={userGridContext}
                rowHeight={56}
                headerHeight={40}
              />
            )}
          </CardBody>
        </Card>
      )}

      {editingRole && (
        <RoleFormModal
          initial={editingRole === "new" ? undefined : editingRole}
          onClose={() => setEditingRole(null)}
          onSubmit={(payload) => saveRoleMutation.mutate(payload)}
          isSubmitting={saveRoleMutation.isPending}
        />
      )}
      {editingUser && (
        <UserFormModal
          initial={editingUser === "new" ? undefined : editingUser}
          roles={rolesQuery.data ?? []}
          onClose={() => setEditingUser(null)}
          onSubmit={(payload) => saveUserMutation.mutate(payload)}
          isSubmitting={saveUserMutation.isPending}
        />
      )}
    </div>
  );
}
