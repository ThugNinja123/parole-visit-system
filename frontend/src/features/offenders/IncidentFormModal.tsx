import { useState } from "react";

import type { IncidentPayload } from "@/api/offenders";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
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
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="incident-form" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save incident"}
          </Button>
        </>
      }
    >
      <form
        id="incident-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(form);
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Incident type">
            <Select
              aria-label="Incident type"
              value={form.incident_type}
              onValueChange={(v) => setForm((f) => ({ ...f, incident_type: v as IncidentType }))}
              options={INCIDENT_TYPES}
            />
          </FormField>
          <FormField label="Status">
            <Select
              aria-label="Status"
              value={form.status}
              onValueChange={(v) => setForm((f) => ({ ...f, status: v as IncidentStatus }))}
              options={INCIDENT_STATUSES}
            />
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
      </form>
    </Modal>
  );
}
