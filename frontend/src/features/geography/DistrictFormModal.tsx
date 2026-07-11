import { useState } from "react";

import type { DistrictPayload } from "@/api/geography";
import { LocationPicker } from "@/components/LocationPicker";
import { Button } from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import type { District } from "@/types";

export function DistrictFormModal({
  initial,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  initial?: District;
  onClose: () => void;
  onSubmit: (payload: DistrictPayload) => void;
  isSubmitting: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [code, setCode] = useState(initial?.code ?? "");
  const [latitude, setLatitude] = useState<number | null>(initial?.latitude ?? null);
  const [longitude, setLongitude] = useState<number | null>(initial?.longitude ?? null);

  return (
    <Modal
      title={initial ? "Edit district" : "Create district"}
      onClose={onClose}
      wide
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="district-form" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save district"}
          </Button>
        </>
      }
    >
      <form
        id="district-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({ name, code: code || undefined, latitude, longitude });
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField label="District name" required>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </FormField>
          <FormField label="Code">
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. CEN" />
          </FormField>
        </div>

        <FormField label="Location (optional)">
          <LocationPicker
            latitude={latitude ?? 0}
            longitude={longitude ?? 0}
            onChange={(lat, lng) => {
              setLatitude(lat);
              setLongitude(lng);
            }}
          />
        </FormField>
      </form>
    </Modal>
  );
}
