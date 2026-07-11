import { Dropdown, type DropdownChangeEvent } from "primereact/dropdown";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

import { fieldClasses } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

export interface SelectOption {
  label: ReactNode;
  value: string;
  disabled?: boolean;
}

export interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: ReactNode;
  id?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder,
  id,
  name,
  required,
  disabled,
  className,
  "aria-label": ariaLabel,
}: SelectProps) {
  const placeholderText = typeof placeholder === "string" ? placeholder : undefined;

  return (
    <Dropdown
      inputId={id}
      name={name}
      required={required}
      disabled={disabled}
      aria-label={ariaLabel}
      value={value === "" ? null : value}
      options={options}
      optionLabel="label"
      optionValue="value"
      optionDisabled="disabled"
      placeholder={placeholderText}
      onChange={(e: DropdownChangeEvent) => onValueChange(e.value == null ? "" : String(e.value))}
      unstyled
      dropdownIcon={<ChevronDown className="h-3.5 w-3.5 text-on-surface-variant" aria-hidden />}
      pt={{
        root: {
          className: cn(
            fieldClasses,
            "relative flex items-center justify-between gap-2 text-left",
            className,
          ),
        },
        input: {
          className: "flex-1 truncate bg-transparent text-sm text-on-surface outline-none",
        },
        trigger: {
          className: "flex shrink-0 items-center text-on-surface-variant",
        },
        panel: {
          className:
            "mt-1 max-h-96 overflow-y-auto rounded border border-outline-variant bg-surface-container-lowest py-1 text-sm text-on-surface shadow-lg",
        },
        list: {
          className: "m-0 list-none p-0",
        },
        item: {
          className:
            "relative flex cursor-pointer items-center justify-between gap-2 px-3 py-1.5 outline-none data-p-highlight:bg-surface-container-low data-p-focused:bg-surface-container-low data-p-disabled:cursor-not-allowed data-p-disabled:opacity-50",
        },
        emptyMessage: {
          className: "px-3 py-1.5 text-on-surface-variant",
        },
      }}
      valueTemplate={(option) => {
        if (option == null) {
          return (
            <span className="text-outline">{placeholder ?? ""}</span>
          );
        }
        return <span className="truncate">{option.label}</span>;
      }}
      itemTemplate={(option: SelectOption) => <span className="truncate">{option.label}</span>}
    />
  );
}
