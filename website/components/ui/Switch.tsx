"use client";

import { forwardRef, useId } from "react";
import * as RadixSwitch from "@radix-ui/react-switch";
import type { ReactNode } from "react";

interface SwitchProps extends RadixSwitch.SwitchProps {
  label?: ReactNode;
}

/**
 * Built on @radix-ui/react-switch for correct keyboard (Space/Enter to
 * toggle) and ARIA (role="switch", aria-checked) behavior.
 */
const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  { label, id, className = "", ...switchProps },
  ref
) {
  const generatedId = useId();
  const switchId = id ?? generatedId;

  return (
    <div className="flex items-center gap-2.5">
      <RadixSwitch.Root
        ref={ref}
        id={switchId}
        className={`relative h-6 w-11 shrink-0 rounded-full border-2 border-bone bg-panel-2 transition-colors data-[state=checked]:bg-amber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/50 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...switchProps}
      >
        <RadixSwitch.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-bone transition-transform duration-200 data-[state=checked]:translate-x-[22px] data-[state=checked]:bg-ink" />
      </RadixSwitch.Root>

      {label && (
        <label
          htmlFor={switchId}
          className="cursor-pointer text-sm font-medium text-bone select-none"
        >
          {label}
        </label>
      )}
    </div>
  );
});

export default Switch;
