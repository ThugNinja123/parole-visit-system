import { Card as PrimeCard } from "primereact/card";
import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <PrimeCard
      unstyled
      className={cn(
        "rounded-lg border border-outline-variant bg-surface-container-lowest shadow-sm",
        className,
      )}
      pt={{
        root: {
          className: cn(
            "rounded-lg border border-outline-variant bg-surface-container-lowest shadow-sm",
            className,
          ),
        },
        body: { className: "p-0" },
        content: { className: "p-0" },
      }}
      {...props}
    >
      {children as ReactNode}
    </PrimeCard>
  );
}

export function CardHeader({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-outline-variant px-5 py-4",
        className,
      )}
      {...props}
    />
  );
}

export function CardBody({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}
