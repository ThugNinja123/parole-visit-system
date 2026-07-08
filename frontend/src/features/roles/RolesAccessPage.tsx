import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { createRole, createUser, deleteRole, fetchRoles, fetchUsers, updateRole, updateUser } from "@/api/roles";
import { PermissionGate } from "@/components/PermissionGate";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { FullPageSpinner } from "@/components/ui/Spinner";
import type { AppUser, Role } from "@/types";

import { RoleFormModal } from "@/features/roles/RoleFormModal";
import { UserFormModal } from "@/features/roles/UserFormModal";

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
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              tab === key
                ? "border-b-2 border-primary text-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {key}
          </button>
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
          <CardBody className="space-y-3">
            {rolesQuery.data?.map((role) => (
              <div
                key={role.id}
                className="flex items-center justify-between rounded border border-outline-variant px-4 py-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-on-surface">{role.name}</p>
                    {role.is_system && <Badge tone="neutral">system</Badge>}
                    <Badge tone="blue">{role.user_count} users</Badge>
                  </div>
                  <p className="text-xs text-on-surface-variant">{role.description}</p>
                  <p className="mt-1 text-xs text-outline">{role.permissions.length} permissions granted</p>
                </div>
                <PermissionGate code="role.manage">
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setEditingRole(role)}>
                      Edit
                    </Button>
                    {!role.is_system && (
                      <Button variant="danger" onClick={() => deleteRoleMutation.mutate(role.id)}>
                        Delete
                      </Button>
                    )}
                  </div>
                </PermissionGate>
              </div>
            ))}
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
          <CardBody className="space-y-3">
            {usersQuery.isLoading && <FullPageSpinner />}
            {usersQuery.data?.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded border border-outline-variant px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-on-surface">
                    {user.first_name} {user.last_name} ({user.username})
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {user.police_station_name ?? "Unassigned station"} - {user.role_names.join(", ") || "No role"}
                  </p>
                </div>
                <PermissionGate code="user.manage">
                  <Button variant="secondary" onClick={() => setEditingUser(user)}>
                    Edit
                  </Button>
                </PermissionGate>
              </div>
            ))}
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
