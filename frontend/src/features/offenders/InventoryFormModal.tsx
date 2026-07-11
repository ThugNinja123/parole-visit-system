import { useState } from "react";

import type { InventoryItemPayload } from "@/api/criminalRecords";
import { Button } from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import type { Crime, InventoryItemType } from "@/types";

export function InventoryFormModal({
  offenderId,
  crimes,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  offenderId: number;
  crimes: Crime[];
  onClose: () => void;
  onSubmit: (payload: InventoryItemPayload) => void;
  isSubmitting: boolean;
}) {
  const [form, setForm] = useState<InventoryItemPayload>({
    offender: offenderId,
    crime: null,
    item_type: "weapon",
    description: "",
    quantity: "",
    storage_location: "",
    status: "in_custody",
    date_seized: null,
  });

  return (
    <Modal title="Add inventory / evidence item" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(form);
        }}
        className="space-y-4"
      >
        <FormField label="Item type">
          <Select
            aria-label="Item type"
            value={form.item_type}
            onValueChange={(v) => setForm((f) => ({ ...f, item_type: v as InventoryItemType }))}
            options={[
              { value: "weapon", label: "Weapon" },
              { value: "substance", label: "Substance / Narcotic" },
              { value: "other", label: "Other" },
            ]}
          />
        </FormField>
        <FormField label="Description">
          <Input
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="e.g. Country-made pistol"
            required
          />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Quantity">
            <Input
              value={form.quantity}
              onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
              placeholder="e.g. 1 unit, 250g"
            />
          </FormField>
          <FormField label="Date seized">
            <Input
              type="date"
              value={form.date_seized ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, date_seized: e.target.value || null }))}
            />
          </FormField>
        </div>
        <FormField label="Storage location">
          <Input
            value={form.storage_location}
            onChange={(e) => setForm((f) => ({ ...f, storage_location: e.target.value }))}
            placeholder="e.g. Station malkhana, Rack 4"
            required
          />
        </FormField>
        <FormField label="Related crime (optional)">
          <Select
            aria-label="Related crime"
            value={form.crime != null ? String(form.crime) : ""}
            onValueChange={(v) => setForm((f) => ({ ...f, crime: v ? Number(v) : null }))}
            options={[
              { value: "", label: "Not linked to a specific crime" },
              ...crimes.map((c) => ({
                value: String(c.id),
                label: `${c.crime_type} - ${c.date_committed ?? "no date"}`,
              })),
            ]}
          />
        </FormField>
        <FormField label="Custody status">
          <Select
            aria-label="Custody status"
            value={form.status}
            onValueChange={(v) => setForm((f) => ({ ...f, status: v as InventoryItemPayload["status"] }))}
            options={[
              { value: "in_custody", label: "In custody" },
              { value: "released", label: "Released" },
              { value: "destroyed", label: "Destroyed" },
            ]}
          />
        </FormField>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Add item"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
