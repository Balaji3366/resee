"use client";

import { useId } from "react";
import * as RadixSelect from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Single-select dropdown built on @radix-ui/react-select — keyboard
 * navigation (arrow keys, typeahead, Home/End) and ARIA are handled by
 * the primitive. For a native multi-select or combobox/autocomplete, see
 * docs/standards/design-system.md's deferred-components list.
 */
export default function Select({
  options,
  value,
  onValueChange,
  placeholder = "Select…",
  label,
  error,
  disabled,
  className = "",
}: SelectProps) {
  const generatedId = useId();
  const triggerId = `select-${generatedId}`;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={triggerId} className="mb-1.5 block text-sm font-bold text-bone">
          {label}
        </label>
      )}

      <RadixSelect.Root value={value} onValueChange={onValueChange} disabled={disabled}>
        <RadixSelect.Trigger
          id={triggerId}
          aria-invalid={!!error}
          className={`flex h-11 w-full items-center justify-between rounded-[12px] border-2 bg-panel px-4 text-bone transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
            error
              ? "border-red-500"
              : "border-bone/15 focus:border-amber data-[state=open]:border-amber"
          }`}
        >
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon>
            <ChevronDown size={18} className="text-slate" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content
            position="popper"
            sideOffset={6}
            className="radix-content z-50 max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-[16px] border-2 border-bone bg-panel"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <RadixSelect.Viewport className="p-1.5">
              {options.map((option) => (
                <RadixSelect.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-sm text-bone outline-none data-[highlighted]:bg-amber/10 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-40"
                >
                  <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                  <RadixSelect.ItemIndicator>
                    <Check size={16} className="text-amber" />
                  </RadixSelect.ItemIndicator>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>

      {error && (
        <p role="alert" className="mt-1.5 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
