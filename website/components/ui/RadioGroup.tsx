"use client";

import { useId } from "react";
import * as RadixRadioGroup from "@radix-ui/react-radio-group";
import type { ReactNode } from "react";

export const RadioGroup = RadixRadioGroup.Root;

interface RadioItemProps extends RadixRadioGroup.RadioGroupItemProps {
  label?: ReactNode;
}

/**
 * Built on @radix-ui/react-radio-group for correct roving-tabindex
 * keyboard navigation (arrow keys move selection within the group) and
 * ARIA (role="radiogroup"/"radio"). Usage:
 *   <RadioGroup value={value} onValueChange={setValue} className="flex flex-col gap-3">
 *     <RadioItem value="a" label="Option A" />
 *     <RadioItem value="b" label="Option B" />
 *   </RadioGroup>
 */
export function RadioItem({ label, id, className = "", ...itemProps }: RadioItemProps) {
  const generatedId = useId();
  const itemId = id ?? generatedId;

  return (
    <div className="flex items-center gap-2.5">
      <RadixRadioGroup.Item
        id={itemId}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-bone bg-panel transition-colors data-[state=checked]:border-amber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/50 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...itemProps}
      >
        <RadixRadioGroup.Indicator className="h-2.5 w-2.5 rounded-full bg-amber" />
      </RadixRadioGroup.Item>

      {label && (
        <label
          htmlFor={itemId}
          className="cursor-pointer text-sm font-medium text-bone select-none"
        >
          {label}
        </label>
      )}
    </div>
  );
}
