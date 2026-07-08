import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { fetchPermissionCatalog, type RolePayload } from "@/api/roles";
import { Button } from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import type { Role } from "@/types";

export function RoleFormModal({
  initial,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  initial?: Role;
  onClose: () => void;
  onSubmit: (payload: RolePayload) => void;
  isSubmitting: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [selected, setSelected] = useState<Set<number>>(
    new Set(initial?.permissions.map((p) => p.id) ?? []),
  );

  const catalogQuery = useQuery({ queryKey: ["permission-catalog"], queryFn: fetchPermissionCatalog });

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <Modal title={initial ? "Edit role" : "Create role"} onClose={onClose} wide>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({ name, description, permission_ids: Array.from(selected) });
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Role name" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={initial?.is_system}
              required
            />
          </FormField>
          <FormField label="Description">
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </FormField>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-on-surface-variant">Permissions</p>
          <div className="max-h-80 space-y-4 overflow-y-auto rounded border border-outline-variant p-4">
            {catalogQuery.data?.map((group) => (
              <div key={group.category}>
                <p className="mb-1.5 text-label-md text-outline">{group.category}</p>
                <div className="grid grid-cols-2 gap-2">
                  {group.permissions.map((perm) => (
                    <label key={perm.id} className="flex items-center gap-2 text-sm text-on-surface-variant">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
                        checked={selected.has(perm.id)}
                        onChange={() => toggle(perm.id)}
                      />
                      {perm.label}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save role"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
