import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import {
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
  forwardRef,
} from "react";

import { cn } from "@/lib/utils";

export const fieldClasses =
  "w-full rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface placeholder:text-outline focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15";

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "color" | "value"> & {
  value?: string | number | readonly string[] | null;
};

function toInputValue(value: InputProps["value"]): string | undefined {
  if (value == null) return undefined;
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return value[0];
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, value, ...props }, ref) => (
  <InputText
    ref={ref}
    unstyled
    className={cn(fieldClasses, className)}
    value={toInputValue(value)}
    {...props}
  />
));
Input.displayName = "Input";

type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value"> & {
  value?: string | number | readonly string[] | null;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, value, ...props }, ref) => (
    <InputTextarea
      ref={ref}
      unstyled
      className={cn(fieldClasses, className)}
      value={toInputValue(value)}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export function Label({
  required,
  className,
  children,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <label className={cn("mb-1 block text-sm font-medium text-on-surface-variant", className)} {...props}>
      {children}
      {required && <span className="text-primary"> *</span>}
    </label>
  );
}

export function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      {children}
    </div>
  );
}
