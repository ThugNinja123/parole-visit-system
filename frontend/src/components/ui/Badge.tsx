import type { ReactNode } from "react";

import type { Offender } from "@/types";

type Tone = "neutral" | "green" | "amber" | "red" | "blue" | "orange" | "medium";
type ComplianceTone = "violation" | "warning" | "compliant";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-surface-variant text-on-surface-variant",
  green: "bg-emerald-100 text-emerald-800",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-error-container text-on-error-container",
  blue: "bg-primary-fixed-dim text-on-primary-fixed",
  orange: "bg-secondary-container/15 text-secondary",
  medium: "bg-secondary-fixed text-on-secondary-fixed-variant",
};

const complianceClasses: Record<ComplianceTone, string> = {
  violation: "bg-secondary-container text-on-secondary-container",
  warning: "border border-outline-variant bg-surface-container-high text-on-surface",
  compliant: "bg-primary-fixed-dim text-on-primary-fixed",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  const isAlert = tone === "red" || tone === "orange";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] leading-[16.5px] ${toneClasses[tone]}`}
    >
      {isAlert && <span aria-hidden>⚠</span>}
      {children}
    </span>
  );
}

export function ComplianceBadge({
  tone,
  children,
}: {
  tone: ComplianceTone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] leading-[16.5px] ${complianceClasses[tone]}`}
    >
      {children}
    </span>
  );
}

export function riskTone(risk: string): Tone {
  if (risk === "high") return "red";
  if (risk === "medium") return "medium";
  return "neutral";
}

export function complianceStatus(offender: Offender): { label: string; tone: ComplianceTone } {
  if (offender.parole_status === "absconded") {
    return { label: "Violation Active", tone: "violation" };
  }
  if (offender.last_visit?.location_status === "flagged") {
    return { label: "Violation Active", tone: "violation" };
  }
  if (offender.risk_level === "high" || offender.risk_level === "medium") {
    return { label: "Warning", tone: "warning" };
  }
  return { label: "Compliant", tone: "compliant" };
}

export function isHighRiskViolationRow(offender: Offender): boolean {
  const compliance = complianceStatus(offender);
  return offender.risk_level === "high" && compliance.tone === "violation";
}

export function locationStatusTone(status: string): Tone {
  return status === "verified" ? "green" : "red";
}

export function incidentStatusTone(status: string): Tone {
  if (status === "infraction") return "red";
  if (status === "resolved") return "green";
  return "amber";
}
