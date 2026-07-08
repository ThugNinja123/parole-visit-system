import { useState } from "react";

import type { CrimePayload } from "@/api/criminalRecords";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Select, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import type { CrimeType } from "@/types";

const CRIME_TYPES: { value: CrimeType; label: string }[] = [
  { value: "theft", label: "Theft" },
  { value: "robbery", label: "Robbery" },
  { value: "assault", label: "Assault" },
  { value: "homicide", label: "Homicide" },
  { value: "drug_offense", label: "Drug Offense" },
  { value: "weapons_offense", label: "Weapons Offense" },
  { value: "fraud", label: "Fraud" },
  { value: "other", label: "Other" },
];

export function CrimeFormModal({
  offenderId,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  offenderId: number;
  onClose: () => void;
  onSubmit: (payload: CrimePayload) => void;
  isSubmitting: boolean;
}) {
  const [form, setForm] = useState<CrimePayload>({
    offender: offenderId,
    crime_type: "other",
    description: "",
    date_committed: null,
    case_number: "",
  });

  return (
    <Modal title="Add crime record" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(form);
        }}
        className="space-y-4"
      >
        <FormField label="Crime type">
          <Select
            value={form.crime_type}
            onChange={(e) => setForm((f) => ({ ...f, crime_type: e.target.value as CrimeType }))}
          >
            {CRIME_TYPES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Date committed">
          <Input
            type="date"
            value={form.date_committed ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, date_committed: e.target.value || null }))}
          />
        </FormField>
        <FormField label="Case / FIR number">
          <Input
            value={form.case_number}
            onChange={(e) => setForm((f) => ({ ...f, case_number: e.target.value }))}
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
            {isSubmitting ? "Saving..." : "Add crime"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
