import { useState } from "react";

import type { PoliceStationPayload } from "@/api/geography";
import { LocationPicker } from "@/components/LocationPicker";
import { Button } from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import type { District, PoliceStation } from "@/types";

export function PoliceStationFormModal({
  initial,
  districts,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  initial?: PoliceStation;
  districts: District[];
  onClose: () => void;
  onSubmit: (payload: PoliceStationPayload) => void;
  isSubmitting: boolean;
}) {
  const [district, setDistrict] = useState<number | "">(initial?.district ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [code, setCode] = useState(initial?.code ?? "");
  const [latitude, setLatitude] = useState<number | null>(initial?.latitude ?? null);
  const [longitude, setLongitude] = useState<number | null>(initial?.longitude ?? null);

  return (
    <Modal
      title={initial ? "Edit police station" : "Create police station"}
      onClose={onClose}
      wide
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="police-station-form" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save police station"}
          </Button>
        </>
      }
    >
      <form
        id="police-station-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!district) return;
          onSubmit({ district: Number(district), name, code: code || undefined, latitude, longitude });
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField label="District" required>
            <Select
              aria-label="District"
              value={district ? String(district) : ""}
              onValueChange={(v) => setDistrict(v ? Number(v) : "")}
              required
              placeholder="Select district"
              options={[
                { value: "", label: "Select district", disabled: true },
                ...districts.map((d) => ({ value: String(d.id), label: d.name })),
              ]}
            />
          </FormField>
          <FormField label="Police station name" required>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </FormField>
        </div>
        <FormField label="Code">
          <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. CEN01" />
        </FormField>

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
