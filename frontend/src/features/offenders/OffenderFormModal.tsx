import { useQuery } from "@tanstack/react-query";
import { FileText, MapPin, User } from "lucide-react";
import { useState } from "react";

import { fetchDistricts, fetchPoliceStations } from "@/api/geography";
import type { OffenderFormValues } from "@/api/offenders";
import { LocationPicker } from "@/components/LocationPicker";
import { Button } from "@/components/ui/Button";
import { FormSection } from "@/components/ui/FormSection";
import { FormField, Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import type { EyeColor, Offender } from "@/types";

const EYE_COLORS: { value: EyeColor; label: string }[] = [
  { value: "", label: "Select" },
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
  // gps_monitor_enabled: false,
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
  const isEdit = Boolean(initial);

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
          // gps_monitor_enabled: initial.gps_monitor_enabled,
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
    <Modal
      title={isEdit ? "Edit Offender" : "Register New Offender"}
      subtitle={
        isEdit
          ? "Update this offender's profile in the Sentinel Command directory."
          : "Create a new profile in the Sentinel Command directory."
      }
      onClose={onClose}
      xl
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="offender-form" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEdit ? "Save offender" : "Register Offender"}
          </Button>
        </>
      }
    >
      <form
        id="offender-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(form);
        }}
        className="space-y-8"
      >
        <FormSection
          title="Personal Information"
          icon={<User className="size-5 text-primary" />}
          iconClassName="bg-[#eff6ff] text-primary"
        >
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Full Name" required>
              <Input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Legal first and last name"
                required
              />
            </FormField>
            <FormField label="Aliases">
              <Input
                value={form.aliases}
                onChange={(e) => update("aliases", e.target.value)}
                placeholder="Comma-separated"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Date of Birth">
                <Input
                  type="date"
                  value={form.date_of_birth ?? ""}
                  onChange={(e) => update("date_of_birth", e.target.value || null)}
                />
              </FormField>
              <FormField label="Mobile Number">
                <Input
                  value={form.mobile_no}
                  onChange={(e) => update("mobile_no", e.target.value)}
                  placeholder="(555) 000-0000"
                />
              </FormField>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <FormField label="Height">
                <Input
                  value={form.height}
                  onChange={(e) => update("height", e.target.value)}
                  placeholder={`6' 1"`}
                />
              </FormField>
              <FormField label="Weight">
                <Input
                  value={form.weight}
                  onChange={(e) => update("weight", e.target.value)}
                  placeholder="195 lbs"
                />
              </FormField>
              <FormField label="Eye Color">
                <Select
                  aria-label="Eye Color"
                  value={form.eye_color}
                  onValueChange={(v) => update("eye_color", v as EyeColor)}
                  options={EYE_COLORS}
                />
              </FormField>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Present Address">
              <Textarea
                value={form.present_address}
                onChange={(e) => update("present_address", e.target.value)}
                placeholder="Street, City, State, ZIP"
                rows={3}
              />
            </FormField>
            <FormField label="Current Employer">
              <Input
                value={form.employer_name}
                onChange={(e) => update("employer_name", e.target.value)}
                placeholder="Employer name or 'Unemployed'"
              />
            </FormField>
          </div>
        </FormSection>

        <FormSection
          title="Case & Conviction Details"
          icon={<FileText className="size-5 text-[#ea580c]" />}
          iconClassName="bg-[#fff7ed] text-[#ea580c]"
        >
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Case / Tracking ID">
              <Input
                value={form.case_number}
                onChange={(e) => update("case_number", e.target.value)}
                placeholder="e.g. P-84729-2"
              />
            </FormField>
            <FormField label="Date of Last Arrest">
              <Input
                type="date"
                value={form.date_of_last_arrest ?? ""}
                onChange={(e) => update("date_of_last_arrest", e.target.value || null)}
              />
            </FormField>
          </div>

          <FormField label="Conviction Summary">
            <Input
              value={form.conviction_summary}
              onChange={(e) => update("conviction_summary", e.target.value)}
              placeholder="e.g. Aggravated Assault (Felony Class B)"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Sentence (Years)">
              <Input
                type="number"
                min={0}
                value={form.sentence_years ?? ""}
                onChange={(e) => update("sentence_years", e.target.value ? Number(e.target.value) : null)}
              />
            </FormField>
            <FormField label="Years Served">
              <Input
                type="number"
                min={0}
                value={form.years_served ?? ""}
                onChange={(e) => update("years_served", e.target.value ? Number(e.target.value) : null)}
              />
            </FormField>
          </div>
        </FormSection>

        <FormSection
          title="Parole & Assignment"
          icon={<MapPin className="size-5 text-on-surface-variant" />}
          iconClassName="bg-surface-container-low text-on-surface-variant"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Parole Granted">
                <Input
                  type="date"
                  value={form.parole_granted_date ?? ""}
                  onChange={(e) => update("parole_granted_date", e.target.value || null)}
                />
              </FormField>
              <FormField label="Parole End Date">
                <Input
                  type="date"
                  value={form.parole_end_date ?? ""}
                  onChange={(e) => update("parole_end_date", e.target.value || null)}
                />
              </FormField>
            </div>
            <FormField label="Parole Status">
              <Select
                aria-label="Parole Status"
                value={form.parole_status}
                onValueChange={(v) => update("parole_status", v as OffenderFormValues["parole_status"])}
                options={[
                  { value: "active", label: "Active" },
                  { value: "completed", label: "Completed" },
                  { value: "absconded", label: "Absconded" },
                ]}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="District" required>
              <Select
                aria-label="District"
                value={form.district ? String(form.district) : ""}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, district: Number(v), police_station: 0, ps_arrested: null }))
                }
                required
                placeholder="Select district"
                options={[
                  { value: "", label: "Select district", disabled: true },
                  ...(districtsQuery.data?.map((d) => ({ value: String(d.id), label: d.name })) ?? []),
                ]}
              />
            </FormField>
            <FormField label="Home Police Station" required>
              <Select
                aria-label="Home Police Station"
                value={form.police_station ? String(form.police_station) : ""}
                onValueChange={(v) => update("police_station", Number(v))}
                disabled={!form.district}
                required
                placeholder="Select station"
                options={[
                  { value: "", label: "Select station", disabled: true },
                  ...(stationsQuery.data?.map((s) => ({ value: String(s.id), label: s.name })) ?? []),
                ]}
              />
            </FormField>
          </div>

          <FormField label="Arrested at (optional)">
            <Select
              aria-label="Arrested at"
              value={form.ps_arrested != null ? String(form.ps_arrested) : ""}
              onValueChange={(v) => update("ps_arrested", v ? Number(v) : null)}
              disabled={!form.district}
              options={[
                { value: "", label: "Same as home station" },
                ...(stationsQuery.data?.map((s) => ({ value: String(s.id), label: s.name })) ?? []),
              ]}
            />
          </FormField>

          {/* <label className="flex cursor-pointer items-start gap-3 rounded border border-outline-variant bg-surface-container-low p-4">
            <input
              type="checkbox"
              checked={form.gps_monitor_enabled}
              onChange={(e) => update("gps_monitor_enabled", e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary/30"
            />
            <span>
              <span className="block text-sm font-medium text-on-surface">Active GPS Ankle Monitor</span>
              <span className="block text-sm text-on-surface-variant">
                Requires daily tracking and signal verification.
              </span>
            </span>
          </label> */}

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
        </FormSection>
      </form>
    </Modal>
  );
}
