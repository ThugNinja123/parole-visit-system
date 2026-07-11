import { useState } from "react";

import type { ParoleConditionPayload } from "@/api/offenders";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

export function ParoleConditionFormModal({
  offenderId,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  offenderId: number;
  onClose: () => void;
  onSubmit: (payload: ParoleConditionPayload) => void;
  isSubmitting: boolean;
}) {
  const [form, setForm] = useState<ParoleConditionPayload>({
    offender: offenderId,
    title: "",
    description: "",
    is_violated: false,
  });

  return (
    <Modal
      title="Add parole condition"
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="parole-condition-form" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Add condition"}
          </Button>
        </>
      }
    >
      <form
        id="parole-condition-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(form);
        }}
        className="space-y-4"
      >
        <FormField label="Condition title" required>
          <Input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Curfew Mandatory"
            required
          />
        </FormField>
        <FormField label="Description">
          <Textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="e.g. Must be at primary residence between 20:00 and 06:00."
          />
        </FormField>
        <label className="flex items-center gap-2 text-sm text-on-surface-variant">
          <input
            type="checkbox"
            checked={form.is_violated}
            onChange={(e) => setForm((f) => ({ ...f, is_violated: e.target.checked }))}
            className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary/30"
          />
          Currently in violation (highlights this condition in red)
        </label>
      </form>
    </Modal>
  );
}
