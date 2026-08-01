"use client";

import * as RadixPopover from "@radix-ui/react-popover";
import type { ReactNode } from "react";

export const Popover = RadixPopover.Root;
export const PopoverTrigger = RadixPopover.Trigger;
export const PopoverClose = RadixPopover.Close;
export const PopoverAnchor = RadixPopover.Anchor;

interface PopoverContentProps {
  children: ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
}

/**
 * Built on @radix-ui/react-popover — focus management, Escape-to-close,
 * and outside-click dismissal handled by the primitive. The shared base
 * MultiSelect.tsx composes with Checkbox items inside.
 */
export function PopoverContent({
  children,
  className = "",
  align = "start",
  side = "bottom",
}: PopoverContentProps) {
  return (
    <RadixPopover.Portal>
      <RadixPopover.Content
        align={align}
        side={side}
        sideOffset={6}
        className={`radix-content z-50 rounded-[16px] border-2 border-bone bg-panel p-2 focus:outline-none ${className}`}
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        {children}
      </RadixPopover.Content>
    </RadixPopover.Portal>
  );
}
