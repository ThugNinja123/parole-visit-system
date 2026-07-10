import type { ReactNode } from "react";

export function FormSection({
  title,
  icon,
  iconClassName = "bg-surface-container-low text-on-surface-variant",
  children,
}: {
  title: string;
  icon: ReactNode;
  iconClassName?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 border-b border-outline-variant pb-2">
        <div className={`flex size-8 shrink-0 items-center justify-center rounded ${iconClassName}`}>
          {icon}
        </div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-on-surface">{title}</h3>
      </div>
      {children}
    </section>
  );
}
