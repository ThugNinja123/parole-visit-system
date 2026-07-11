import { useState } from "react";

import { submitVisitRecord, type SubmitVisitRecordInput } from "@/api/visits";
import { Badge, locationStatusTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import {
  buildVisitRemarks,
  VISIT_REMARK_CHECKS,
} from "@/features/visits/visitRemarkChecks";
import type { VisitRecord, VisitSchedule, VisitType } from "@/types";

type GeoState =
  | { status: "idle" }
  | { status: "locating" }
  | { status: "ready"; lat: number; lng: number }
  | { status: "error"; message: string };

const VISIT_TYPES: { value: VisitType; label: string }[] = [
  { value: "field_home", label: "Field Visit - Home" },
  { value: "office_checkin", label: "Office Check-in" },
  { value: "field_employer", label: "Field Visit - Employer" },
  { value: "other", label: "Other" },
];

export function VisitCaptureModal({
  schedule,
  onClose,
  onSubmitted,
}: {
  schedule: VisitSchedule;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [geo, setGeo] = useState<GeoState>({ status: "idle" });
  const [visitType, setVisitType] = useState<VisitType>("field_home");
  const [checkedRemarks, setCheckedRemarks] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<VisitRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  const remarks = buildVisitRemarks(checkedRemarks, additionalNotes);
  const canSubmit = geo.status === "ready" && checkedRemarks.length > 0 && !isSubmitting;

  function toggleRemark(id: string) {
    setCheckedRemarks((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function captureLocation() {
    if (!navigator.geolocation) {
      setGeo({ status: "error", message: "Geolocation is not supported on this device." });
      return;
    }
    setGeo({ status: "locating" });
    navigator.geolocation.getCurrentPosition(
      (position) =>
        setGeo({ status: "ready", lat: position.coords.latitude, lng: position.coords.longitude }),
      (err) => setGeo({ status: "error", message: err.message }),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }

  async function handleSubmit() {
    if (geo.status !== "ready" || checkedRemarks.length === 0) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const input: SubmitVisitRecordInput = {
        schedule: schedule.id,
        offender: schedule.offender,
        visit_type: visitType,
        officer_latitude: geo.lat,
        officer_longitude: geo.lng,
        remarks,
        visit_photo: photo,
      };
      const record = await submitVisitRecord(input);
      setResult(record);
      onSubmitted();
    } catch {
      setError("Could not submit the visit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (result) {
    return (
      <Modal title="Visit submitted" onClose={onClose} wide={true}>
        <div className="space-y-3 text-center">
          <p className="text-sm text-on-surface-variant">
            Visit report for {schedule.offender_name} was recorded.
          </p>
          <Badge tone={locationStatusTone(result.location_status)}>
            {result.location_status === "verified"
              ? `Location verified (${Math.round(result.distance_meters)}m from registered address)`
              : `Location flagged - ${Math.round(result.distance_meters)}m from registered address`}
          </Badge>
          {result.location_status === "flagged" && (
            <p className="text-xs text-on-surface-variant">
              This visit was still recorded. A supervisor will review the location mismatch.
            </p>
          )}
          <Button onClick={onClose} className="w-full">
            Done
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title={`Record visit - ${schedule.offender_name}`} onClose={onClose} xl={true}>
      <div className="space-y-4">
        <FormField label="Visit type">
          <Select
            aria-label="Visit type"
            value={visitType}
            onValueChange={(v) => setVisitType(v as VisitType)}
            options={VISIT_TYPES}
          />
        </FormField>

        <FormField label="Your current location">
          {geo.status === "ready" ? (
            <div className="flex items-center justify-between rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              <span className="font-data">
                Captured: {geo.lat.toFixed(5)}, {geo.lng.toFixed(5)}
              </span>
              <button type="button" onClick={captureLocation} className="text-xs underline">
                Retry
              </button>
            </div>
          ) : (
            <Button type="button" variant="secondary" onClick={captureLocation} className="w-full">
              {geo.status === "locating" ? "Locating..." : "📍 Capture GPS location"}
            </Button>
          )}
          {geo.status === "error" && <p className="mt-1 text-xs text-error">{geo.message}</p>}
        </FormField>

        <FormField label="Photo (offender)">
          <Input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
          />
        </FormField>

        <div>
          <p className="mb-2 text-sm font-medium text-on-surface-variant">
            Officer observations <span className="text-primary">*</span>
          </p>
          <div className="max-h-56 space-y-2 overflow-y-auto rounded border border-outline-variant bg-surface-container-lowest p-3">
            {VISIT_REMARK_CHECKS.map((item) => (
              <label
                key={item.id}
                className="flex cursor-pointer items-start gap-2.5 text-sm text-on-surface"
              >
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-outline-variant text-primary focus:ring-primary/30"
                  checked={checkedRemarks.includes(item.id)}
                  onChange={() => toggleRemark(item.id)}
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
          {checkedRemarks.length === 0 && (
            <p className="mt-1 text-xs text-on-surface-variant">Select at least one observation.</p>
          )}
        </div>

        <FormField label="Additional notes">
          <Textarea
            rows={2}
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="Optional free-text details"
          />
        </FormField>

        {error && <p className="text-sm text-error">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={!canSubmit}>
            {isSubmitting ? "Submitting..." : "Submit visit report"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
