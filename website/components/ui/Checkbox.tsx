"use client";

import { forwardRef, useId } from "react";
import * as RadixCheckbox from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import type { ReactNode } from "react";

interface CheckboxProps extends RadixCheckbox.CheckboxProps {
  label?: ReactNode;
}

/**
 * Built on @radix-ui/react-checkbox for correct keyboard (Space to
 * toggle) and ARIA (role="checkbox", aria-checked) behavior.
 */
const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(function Checkbox(
  { label, id, className = "", ...checkboxProps },
  ref
) {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;

  return (
    <div className="flex items-center gap-2.5">
      <RadixCheckbox.Root
        ref={ref}
        id={checkboxId}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border-2 border-bone bg-panel transition-colors data-[state=checked]:border-amber data-[state=checked]:bg-amber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/50 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...checkboxProps}
      >
        <RadixCheckbox.Indicator>
          <Check size={14} strokeWidth={3} className="text-ink" />
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>

      {label && (
        <label
          htmlFor={checkboxId}
          className="cursor-pointer text-sm font-medium text-bone select-none"
        >
          {label}
        </label>
      )}
    </div>
  );
});

export default Checkbox;
