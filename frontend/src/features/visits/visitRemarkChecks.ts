/** Standard officer observation prompts for visit capture remarks. */

export type VisitRemarkCheck = {
  id: string;
  label: string;
};

export const VISIT_REMARK_CHECKS: VisitRemarkCheck[] = [
  { id: "good_behavior", label: "Offender is in good behavior" },
  { id: "cooperative", label: "Cooperative and respectful during visit" },
  { id: "at_address", label: "Present at registered address" },
  { id: "parole_compliant", label: "Complying with parole conditions" },
  { id: "employed", label: "Employed / attending work or education" },
  { id: "sober", label: "Appeared sober and alert" },
  { id: "home_ok", label: "Home / living conditions satisfactory" },
  { id: "support_present", label: "Family or support person present" },
  { id: "follow_up", label: "Follow-up or concern required" },
];

export function buildVisitRemarks(selectedIds: string[], additionalNotes: string): string {
  const selected = VISIT_REMARK_CHECKS.filter((c) => selectedIds.includes(c.id));
  const lines: string[] = [];

  if (selected.length > 0) {
    lines.push("Observations:");
    for (const item of selected) {
      lines.push(`- ${item.label}`);
    }
  }

  const notes = additionalNotes.trim();
  if (notes) {
    if (lines.length > 0) lines.push("");
    lines.push("Additional notes:");
    lines.push(notes);
  }

  return lines.join("\n").trim();
}
