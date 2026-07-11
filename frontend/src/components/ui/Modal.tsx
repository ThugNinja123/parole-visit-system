import { Dialog } from "primereact/dialog";
import { X } from "lucide-react";
import { useId, type ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const MAX_WIDTH_CLASSES = {
  default: "max-w-md",
  wide: "max-w-2xl",
  xl: "max-w-4xl",
} as const;

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
  const titleId = useId();
  const subtitleId = useId();
  const maxWidth = xl ? MAX_WIDTH_CLASSES.xl : wide ? MAX_WIDTH_CLASSES.wide : MAX_WIDTH_CLASSES.default;

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
          className:
            "fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 p-4",
        },
        root: {
          role: "dialog",
          "aria-modal": true,
          "aria-labelledby": titleId,
          "aria-describedby": subtitle ? subtitleId : undefined,
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
      <div className="flex shrink-0 items-start justify-between gap-4 border-b border-outline-variant px-6 py-4">
        <div className="min-w-0">
          <h2 id={titleId} className="text-headline-md text-primary">
            {title}
          </h2>
          {subtitle ? (
            <p id={subtitleId} className="mt-0.5 text-sm text-on-surface-variant">
              {subtitle}
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 text-on-surface-variant hover:text-on-surface"
          aria-label="Close"
          onClick={onClose}
        >
          <X className="h-4 w-4" aria-hidden />
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">{children}</div>

      {footer ? (
        <div className="flex shrink-0 justify-end gap-3 border-t border-outline-variant bg-surface-container-low px-6 py-4">
          {footer}
        </div>
      ) : null}
    </Dialog>
  );
}
