import { useState } from "react";

import type { PoliceStationPayload } from "@/api/geography";
import { LocationPicker } from "@/components/LocationPicker";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
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
    <Modal title={initial ? "Edit police station" : "Create police station"} onClose={onClose} wide>
      <form
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
              value={district}
              onChange={(e) => setDistrict(e.target.value ? Number(e.target.value) : "")}
              required
            >
              <option value="" disabled>
                Select district
              </option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
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

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save police station"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
