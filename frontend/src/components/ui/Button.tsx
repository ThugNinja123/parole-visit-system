import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "danger" | "warning" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:opacity-90 focus-visible:outline-primary",
  secondary:
    "bg-surface-container-lowest text-on-surface border border-outline-variant hover:bg-surface-container-low",
  danger: "bg-error text-on-error hover:opacity-90",
  warning: "bg-secondary text-on-secondary hover:opacity-90",
  ghost: "bg-transparent text-on-surface-variant hover:bg-surface-container-low",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className = "", ...props }, ref) => (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-2 rounded px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  ),
);
Button.displayName = "Button";
