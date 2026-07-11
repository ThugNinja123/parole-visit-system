import { Button as PrimeButton } from "primereact/button";
import { cva, type VariantProps } from "class-variance-authority";
import { type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-on-primary hover:opacity-90",
        secondary:
          "border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low",
        danger: "bg-error text-on-error hover:opacity-90",
        warning: "bg-secondary text-on-secondary hover:opacity-90",
        ghost: "bg-transparent text-on-surface-variant hover:bg-surface-container-low",
      },
      size: {
        default: "px-3.5 py-2",
        sm: "px-2 py-1 text-xs",
        icon: "h-8 w-8 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "disabled" | "color">,
    VariantProps<typeof buttonVariants> {
  disabled?: boolean;
}

export function Button({ variant, size, className, type = "button", children, ...props }: ButtonProps) {
  return (
    <PrimeButton
      type={type}
      unstyled
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </PrimeButton>
  );
}
