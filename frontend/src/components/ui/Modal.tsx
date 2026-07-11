import { Dialog } from "primereact/dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Modal({
  title,
  subtitle,
  onClose,
  children,
  footer,
  wide = false,
  xl = false,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
  xl?: boolean;
}) {
  const maxWidth = xl ? "max-w-4xl" : wide ? "max-w-2xl" : "max-w-md";

  return (
    <Dialog
      visible
      modal
      dismissableMask
      closable={false}
      draggable={false}
      resizable={false}
      blockScroll
      showHeader={false}
      onHide={onClose}
      unstyled
      pt={{
        mask: {
          className: "fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 p-4",
        },
        root: {
          className: cn(
            "flex max-h-[90vh] w-full flex-col overflow-hidden rounded-lg bg-surface-container-lowest shadow-xl outline-none",
            maxWidth,
          ),
        },
        content: {
          className: "flex min-h-0 flex-1 flex-col overflow-hidden p-0",
        },
      }}
    >
      <div className="flex shrink-0 items-start justify-between border-b border-outline-variant px-6 py-4">
        <div>
          <h2 className="text-headline-md text-primary">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-on-surface-variant">{subtitle}</p>}
        </div>
        <button
          type="button"
          className="rounded p-1 text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
          aria-label="Close"
          onClick={onClose}
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
      {footer && (
        <div className="flex shrink-0 justify-end gap-3 border-t border-outline-variant bg-surface-container-low px-6 py-4">
          {footer}
        </div>
      )}
    </Dialog>
  );
}
