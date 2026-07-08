import { useState } from "react";

import type { IncidentPayload } from "@/api/offenders";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Select, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import type { IncidentStatus, IncidentType } from "@/types";

const INCIDENT_TYPES: { value: IncidentType; label: string }[] = [
  { value: "missed_checkin", label: "Missed Check-in" },
  { value: "contraband", label: "Contraband" },
  { value: "curfew_violation", label: "Curfew Violation" },
  { value: "other", label: "Other" },
];

const INCIDENT_STATUSES: { value: IncidentStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "resolved", label: "Resolved" },
  { value: "infraction", label: "Infraction" },
];

export function IncidentFormModal({
  offenderId,
  title = "Log incident",
  defaultStatus = "pending",
  onClose,
  onSubmit,
  isSubmitting,
}: {
  offenderId: number;
  title?: string;
  defaultStatus?: IncidentStatus;
  onClose: () => void;
  onSubmit: (payload: IncidentPayload) => void;
  isSubmitting: boolean;
}) {
  const [form, setForm] = useState<IncidentPayload>({
    offender: offenderId,
    incident_type: "other",
    status: defaultStatus,
    date: new Date().toISOString().slice(0, 10),
    description: "",
  });

  return (
    <Modal title={title} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(form);
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Incident type">
            <Select
              value={form.incident_type}
              onChange={(e) => setForm((f) => ({ ...f, incident_type: e.target.value as IncidentType }))}
            >
              {INCIDENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Status">
            <Select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as IncidentStatus }))}
            >
              {INCIDENT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </FormField>
        </div>
        <FormField label="Date">
          <Input
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            required
          />
        </FormField>
        <FormField label="Description">
          <Textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </FormField>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save incident"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
