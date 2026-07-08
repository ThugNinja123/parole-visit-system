import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { fetchDistricts, fetchPoliceStations } from "@/api/geography";
import type { OffenderFormValues } from "@/api/offenders";
import { LocationPicker } from "@/components/LocationPicker";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Select, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import type { EyeColor, Offender } from "@/types";

const EYE_COLORS: { value: EyeColor; label: string }[] = [
  { value: "", label: "Not recorded" },
  { value: "brown", label: "Brown" },
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "hazel", label: "Hazel" },
  { value: "gray", label: "Gray" },
  { value: "black", label: "Black" },
  { value: "other", label: "Other" },
];

const emptyForm: OffenderFormValues = {
  district: 0,
  police_station: 0,
  ps_arrested: null,
  name: "",
  aliases: "",
  date_of_birth: null,
  mobile_no: "",
  present_address: "",
  date_of_last_arrest: null,
  latitude: 0,
  longitude: 0,
  parole_status: "active",
  risk_level: "low",
  offender_image: null,
  case_number: "",
  gps_monitor_enabled: false,
  height: "",
  weight: "",
  eye_color: "",
  employer_name: "",
  conviction_summary: "",
  sentence_years: null,
  years_served: null,
  parole_granted_date: null,
  parole_end_date: null,
};

export function OffenderFormModal({
  initial,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  initial?: Offender;
  onClose: () => void;
  onSubmit: (values: OffenderFormValues) => void;
  isSubmitting: boolean;
}) {
  const [form, setForm] = useState<OffenderFormValues>(
    initial
      ? {
          district: initial.district,
          police_station: initial.police_station,
          ps_arrested: initial.ps_arrested,
          name: initial.name,
          aliases: initial.aliases,
          date_of_birth: initial.date_of_birth,
          mobile_no: initial.mobile_no,
          present_address: initial.present_address,
          date_of_last_arrest: initial.date_of_last_arrest,
          latitude: initial.latitude,
          longitude: initial.longitude,
          parole_status: initial.parole_status,
          risk_level: initial.risk_level,
          offender_image: null,
          case_number: initial.case_number,
          gps_monitor_enabled: initial.gps_monitor_enabled,
          height: initial.height,
          weight: initial.weight,
          eye_color: initial.eye_color,
          employer_name: initial.employer_name,
          conviction_summary: initial.conviction_summary,
          sentence_years: initial.sentence_years,
          years_served: initial.years_served,
          parole_granted_date: initial.parole_granted_date,
          parole_end_date: initial.parole_end_date,
        }
      : emptyForm,
  );

  const districtsQuery = useQuery({ queryKey: ["districts"], queryFn: fetchDistricts });
  const stationsQuery = useQuery({
    queryKey: ["police-stations", form.district],
    queryFn: () => fetchPoliceStations(form.district || undefined),
    enabled: Boolean(form.district),
  });

  function update<K extends keyof OffenderFormValues>(key: K, value: OffenderFormValues[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <Modal title={initial ? "Edit offender" : "Register new offender"} onClose={onClose} wide>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(form);
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Full name" required>
            <Input value={form.name} onChange={(e) => update("name", e.target.value)} required />
          </FormField>
          <FormField label="Aliases">
            <Input
              value={form.aliases}
              onChange={(e) => update("aliases", e.target.value)}
              placeholder="Comma-separated"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField label="Date of birth">
            <Input
              type="date"
              value={form.date_of_birth ?? ""}
              onChange={(e) => update("date_of_birth", e.target.value || null)}
            />
          </FormField>
          <FormField label="Mobile number">
            <Input value={form.mobile_no} onChange={(e) => update("mobile_no", e.target.value)} />
          </FormField>
          <FormField label="Date of last arrest">
            <Input
              type="date"
              value={form.date_of_last_arrest ?? ""}
              onChange={(e) => update("date_of_last_arrest", e.target.value || null)}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <FormField label="Case / tracking ID">
            <Input
              value={form.case_number}
              onChange={(e) => update("case_number", e.target.value)}
              placeholder="e.g. P-84729-2"
            />
          </FormField>
          <FormField label="Height">
            <Input value={form.height} onChange={(e) => update("height", e.target.value)} placeholder={`6' 1"`} />
          </FormField>
          <FormField label="Weight">
            <Input value={form.weight} onChange={(e) => update("weight", e.target.value)} placeholder="195 lbs" />
          </FormField>
          <FormField label="Eye color">
            <Select value={form.eye_color} onChange={(e) => update("eye_color", e.target.value as EyeColor)}>
              {EYE_COLORS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Present address">
            <Textarea
              value={form.present_address}
              onChange={(e) => update("present_address", e.target.value)}
              rows={2}
            />
          </FormField>
          <FormField label="Employer">
            <Input
              value={form.employer_name}
              onChange={(e) => update("employer_name", e.target.value)}
              placeholder="Employer name"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <FormField label="Conviction summary">
            <Input
              value={form.conviction_summary}
              onChange={(e) => update("conviction_summary", e.target.value)}
              placeholder="e.g. Aggravated Assault (Felony Class B)"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <FormField label="Sentence (years)">
            <Input
              type="number"
              min={0}
              value={form.sentence_years ?? ""}
              onChange={(e) => update("sentence_years", e.target.value ? Number(e.target.value) : null)}
            />
          </FormField>
          <FormField label="Years served">
            <Input
              type="number"
              min={0}
              value={form.years_served ?? ""}
              onChange={(e) => update("years_served", e.target.value ? Number(e.target.value) : null)}
            />
          </FormField>
          <FormField label="Parole granted">
            <Input
              type="date"
              value={form.parole_granted_date ?? ""}
              onChange={(e) => update("parole_granted_date", e.target.value || null)}
            />
          </FormField>
          <FormField label="Parole end date">
            <Input
              type="date"
              value={form.parole_end_date ?? ""}
              onChange={(e) => update("parole_end_date", e.target.value || null)}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField label="District" required>
            <Select
              value={form.district || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, district: Number(e.target.value), police_station: 0 }))
              }
              required
            >
              <option value="" disabled>
                Select district
              </option>
              {districtsQuery.data?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Home police station" required>
            <Select
              value={form.police_station || ""}
              onChange={(e) => update("police_station", Number(e.target.value))}
              disabled={!form.district}
              required
            >
              <option value="" disabled>
                Select station
              </option>
              {stationsQuery.data?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Arrested at (optional)">
            <Select
              value={form.ps_arrested ?? ""}
              onChange={(e) => update("ps_arrested", e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Same as home station</option>
              {stationsQuery.data?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Parole status">
            <Select
              value={form.parole_status}
              onChange={(e) => update("parole_status", e.target.value as OffenderFormValues["parole_status"])}
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="absconded">Absconded</option>
            </Select>
          </FormField>
          <label className="flex items-center gap-2 self-end pb-2 text-sm text-on-surface-variant">
            <input
              type="checkbox"
              checked={form.gps_monitor_enabled}
              onChange={(e) => update("gps_monitor_enabled", e.target.checked)}
              className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary/30"
            />
            Active GPS ankle monitor
          </label>
        </div>

        <FormField label="Registered address location">
          <LocationPicker
            latitude={form.latitude}
            longitude={form.longitude}
            onChange={(lat, lng) => setForm((f) => ({ ...f, latitude: lat, longitude: lng }))}
          />
        </FormField>

        <FormField label="Offender photo">
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => update("offender_image", e.target.files?.[0] ?? null)}
          />
        </FormField>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save offender"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
