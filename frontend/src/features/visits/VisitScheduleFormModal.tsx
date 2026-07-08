import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { fetchOffenders } from "@/api/offenders";
import { fetchUsers } from "@/api/roles";
import type { VisitScheduleInput } from "@/api/visits";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Select, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

export function VisitScheduleFormModal({
  onClose,
  onSubmit,
  isSubmitting,
}: {
  onClose: () => void;
  onSubmit: (payload: VisitScheduleInput) => void;
  isSubmitting: boolean;
}) {
  const [form, setForm] = useState<VisitScheduleInput>({
    offender: 0,
    assigned_officer: 0,
    scheduled_date: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  const offendersQuery = useQuery({
    queryKey: ["offenders", "for-schedule"],
    queryFn: () => fetchOffenders({ parole_status: "active" }),
  });
  const usersQuery = useQuery({ queryKey: ["users", "for-schedule"], queryFn: fetchUsers });

  return (
    <Modal title="Schedule a visit" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(form);
        }}
        className="space-y-4"
      >
        <FormField label="Offender" required>
          <Select
            value={form.offender || ""}
            onChange={(e) => setForm((f) => ({ ...f, offender: Number(e.target.value) }))}
            required
          >
            <option value="" disabled>
              Select offender
            </option>
            {offendersQuery.data?.results.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name} ({o.district_name})
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Assign to officer" required>
          <Select
            value={form.assigned_officer || ""}
            onChange={(e) => setForm((f) => ({ ...f, assigned_officer: Number(e.target.value) }))}
            required
          >
            <option value="" disabled>
              Select officer
            </option>
            {usersQuery.data?.map((u) => (
              <option key={u.id} value={u.id}>
                {u.first_name ? `${u.first_name} ${u.last_name}` : u.username}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Scheduled date" required>
          <Input
            type="date"
            value={form.scheduled_date}
            onChange={(e) => setForm((f) => ({ ...f, scheduled_date: e.target.value }))}
            required
          />
        </FormField>
        <FormField label="Notes">
          <Textarea
            rows={2}
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
        </FormField>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Schedule visit"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
