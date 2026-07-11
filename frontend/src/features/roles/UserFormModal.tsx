import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { fetchPoliceStations } from "@/api/geography";
import type { UserPayload } from "@/api/roles";
import { Button } from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import type { AppUser, Role } from "@/types";

export function UserFormModal({
  initial,
  roles,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  initial?: AppUser;
  roles: Role[];
  onClose: () => void;
  onSubmit: (payload: UserPayload) => void;
  isSubmitting: boolean;
}) {
  const [form, setForm] = useState({
    username: initial?.username ?? "",
    first_name: initial?.first_name ?? "",
    last_name: initial?.last_name ?? "",
    email: initial?.email ?? "",
    phone_number: initial?.phone_number ?? "",
    police_station: initial?.police_station ?? null,
    password: "",
    is_active: initial?.is_active ?? true,
  });
  const [selectedRoles, setSelectedRoles] = useState<Set<number>>(
    new Set(roles.filter((r) => initial?.role_names.includes(r.name)).map((r) => r.id)),
  );

  const stationsQuery = useQuery({ queryKey: ["police-stations", "all"], queryFn: () => fetchPoliceStations() });

  function toggleRole(id: number) {
    setSelectedRoles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <Modal title={initial ? "Edit user" : "Create user"} onClose={onClose} wide>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({
            ...form,
            police_station: form.police_station || null,
            role_ids: Array.from(selectedRoles),
            password: form.password || undefined,
          });
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Username" required>
            <Input
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              disabled={Boolean(initial)}
              required
            />
          </FormField>
          <FormField label="Email">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </FormField>
          <FormField label="First name">
            <Input
              value={form.first_name}
              onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
            />
          </FormField>
          <FormField label="Last name">
            <Input
              value={form.last_name}
              onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
            />
          </FormField>
          <FormField label="Phone number">
            <Input
              value={form.phone_number}
              onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))}
            />
          </FormField>
          <FormField label="Police station">
            <Select
              aria-label="Police station"
              value={form.police_station != null ? String(form.police_station) : ""}
              onValueChange={(v) => setForm((f) => ({ ...f, police_station: v ? Number(v) : null }))}
              options={[
                { value: "", label: "Unassigned" },
                ...(stationsQuery.data?.map((s) => ({
                  value: String(s.id),
                  label: `${s.name} (${s.district_name})`,
                })) ?? []),
              ]}
            />
          </FormField>
        </div>

        <FormField
          label={initial ? "New password (leave blank to keep current)" : "Password"}
          required={!initial}
        >
          <Input
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            required={!initial}
          />
        </FormField>

        <div>
          <p className="mb-2 text-sm font-medium text-on-surface-variant">Roles</p>
          <div className="flex flex-wrap gap-3 rounded border border-outline-variant p-3">
            {roles.map((role) => (
              <label key={role.id} className="flex items-center gap-2 text-sm text-on-surface-variant">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
                  checked={selectedRoles.has(role.id)}
                  onChange={() => toggleRole(role.id)}
                />
                {role.name}
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save user"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
