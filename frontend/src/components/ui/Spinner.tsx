import { ProgressSpinner } from "primereact/progressspinner";

import { cn } from "@/lib/utils";

export function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <ProgressSpinner
      unstyled
      strokeWidth="4"
      className={cn("inline-block", className)}
      pt={{
        root: {
          className: cn(
            "inline-block animate-spin rounded-full border-2 border-outline-variant border-t-primary border-solid",
            className,
          ),
        },
        spinner: { className: "hidden" },
        circle: { className: "hidden" },
      }}
      aria-label="Loading"
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="flex h-full min-h-[50vh] items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}
