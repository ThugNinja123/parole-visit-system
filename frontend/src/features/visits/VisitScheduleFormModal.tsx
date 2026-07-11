import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { fetchOffenders } from "@/api/offenders";
import { fetchUsers } from "@/api/roles";
import type { VisitScheduleInput } from "@/api/visits";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import {
  expandRecurrenceDates,
  formatRecurrenceSummary,
  ordinalDay,
  RECURRENCE_OPTIONS,
  type VisitRecurrence,
} from "@/features/visits/recurrence";

function defaultUntil(startISO: string, recurrence: VisitRecurrence): string {
  if (!startISO || recurrence === "once") return "";
  const [y, m, d] = startISO.split("-").map(Number);
  const start = new Date(y, m - 1, d);
  const monthsAhead = recurrence === "monthly" ? 5 : 2;
  start.setMonth(start.getMonth() + monthsAhead);
  const yy = start.getFullYear();
  const mm = String(start.getMonth() + 1).padStart(2, "0");
  const dd = String(start.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export function VisitScheduleFormModal({
  onClose,
  onSubmit,
  isSubmitting,
}: {
  onClose: () => void;
  onSubmit: (payload: VisitScheduleInput) => void;
  isSubmitting: boolean;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState<VisitScheduleInput>({
    offender: 0,
    assigned_officer: 0,
    scheduled_date: today,
    notes: "",
    recurrence: "once",
    until_date: "",
  });

  const offendersQuery = useQuery({
    queryKey: ["offenders", "for-schedule"],
    queryFn: () => fetchOffenders({ parole_status: "active" }),
  });
  const usersQuery = useQuery({ queryKey: ["users", "for-schedule"], queryFn: fetchUsers });

  const previewDates = useMemo(
    () =>
      expandRecurrenceDates(
        form.scheduled_date,
        form.recurrence ?? "once",
        form.recurrence === "once" ? undefined : form.until_date || undefined,
      ),
    [form.scheduled_date, form.recurrence, form.until_date],
  );

  const summary = useMemo(
    () =>
      formatRecurrenceSummary(
        form.scheduled_date,
        form.recurrence ?? "once",
        form.recurrence === "once" ? undefined : form.until_date || undefined,
      ),
    [form.scheduled_date, form.recurrence, form.until_date],
  );

  const startDay = form.scheduled_date ? Number(form.scheduled_date.slice(8, 10)) : null;
  const isRepeating = (form.recurrence ?? "once") !== "once";

  return (
    <Modal
      title="Schedule a visit"
      onClose={onClose}
      xl={true}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="visit-schedule-form" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : previewDates.length > 1
                ? `Schedule ${previewDates.length} visits`
                : "Schedule visit"}
          </Button>
        </>
      }
    >
      <form
        id="visit-schedule-form"
        onSubmit={(e) => {
          e.preventDefault();
          const payload: VisitScheduleInput = {
            offender: form.offender,
            assigned_officer: form.assigned_officer,
            scheduled_date: form.scheduled_date,
            notes: form.notes,
            recurrence: form.recurrence ?? "once",
          };
          if (payload.recurrence !== "once" && form.until_date) {
            payload.until_date = form.until_date;
          }
          onSubmit(payload);
        }}
        className="space-y-4"
      >
        <FormField label="Offender" required>
          <Select
            aria-label="Offender"
            value={form.offender ? String(form.offender) : ""}
            onValueChange={(v) => setForm((f) => ({ ...f, offender: Number(v) }))}
            required
            placeholder="Select offender"
            options={[
              { value: "", label: "Select offender", disabled: true },
              ...(offendersQuery.data?.results.map((o) => ({
                value: String(o.id),
                label: `${o.name} (${o.district_name})`,
              })) ?? []),
            ]}
          />
        </FormField>
        <FormField label="Assign to officer" required>
          <Select
            aria-label="Assign to officer"
            value={form.assigned_officer ? String(form.assigned_officer) : ""}
            onValueChange={(v) => setForm((f) => ({ ...f, assigned_officer: Number(v) }))}
            required
            placeholder="Select officer"
            options={[
              { value: "", label: "Select officer", disabled: true },
              ...(usersQuery.data?.map((u) => ({
                value: String(u.id),
                label: u.first_name ? `${u.first_name} ${u.last_name}` : u.username,
              })) ?? []),
            ]}
          />
        </FormField>

        <FormField label="Frequency" required>
          <Select
            aria-label="Frequency"
            value={form.recurrence ?? "once"}
            onValueChange={(v) => {
              const recurrence = v as VisitRecurrence;
              setForm((f) => ({
                ...f,
                recurrence,
                until_date:
                  recurrence === "once"
                    ? ""
                    : f.until_date || defaultUntil(f.scheduled_date, recurrence),
              }));
            }}
            options={RECURRENCE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          />
          <p className="mt-1 text-body-sm text-on-surface-variant">
            {RECURRENCE_OPTIONS.find((o) => o.value === (form.recurrence ?? "once"))?.hint}
            {form.recurrence === "monthly" && startDay != null
              ? ` — visits on the ${ordinalDay(startDay)}`
              : null}
          </p>
        </FormField>

        <div className={`grid gap-4 ${isRepeating ? "sm:grid-cols-2" : ""}`}>
          <FormField label={isRepeating ? "First visit date" : "Scheduled date"} required>
            <Input
              type="date"
              value={form.scheduled_date}
              onChange={(e) => {
                const scheduled_date = e.target.value;
                setForm((f) => ({
                  ...f,
                  scheduled_date,
                  until_date:
                    f.recurrence && f.recurrence !== "once" && !f.until_date
                      ? defaultUntil(scheduled_date, f.recurrence)
                      : f.until_date,
                }));
              }}
              required
            />
          </FormField>
          {isRepeating && (
            <FormField label="Repeat until" required>
              <Input
                type="date"
                value={form.until_date ?? ""}
                min={form.scheduled_date}
                onChange={(e) => setForm((f) => ({ ...f, until_date: e.target.value }))}
                required
              />
            </FormField>
          )}
        </div>

        {isRepeating && form.until_date && (
          <div className="rounded-md border border-outline-variant bg-surface-container-low px-3 py-2">
            <p className="text-body-sm text-on-surface">{summary}</p>
            {previewDates.length > 0 && (
              <p className="mt-1 font-data text-body-sm text-on-surface-variant">
                {previewDates.slice(0, 6).join(" · ")}
                {previewDates.length > 6 ? ` · +${previewDates.length - 6} more` : ""}
              </p>
            )}
          </div>
        )}

        <FormField label="Notes">
          <Textarea
            rows={2}
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
        </FormField>
      </form>
    </Modal>
  );
}
