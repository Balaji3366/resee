"use client";

import * as RadixTooltip from "@radix-ui/react-tooltip";
import type { ReactNode } from "react";

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  delayDuration?: number;
}

/**
 * Built on @radix-ui/react-tooltip — shows on hover/focus (keyboard
 * users get it too), dismisses on Escape. Wrap the app once with
 * <TooltipProvider> (see app/layout.tsx) rather than per-instance.
 */
export function TooltipProvider({ children }: { children: ReactNode }) {
  return <RadixTooltip.Provider delayDuration={300}>{children}</RadixTooltip.Provider>;
}

export default function Tooltip({ children, content, side = "top", delayDuration }: TooltipProps) {
  return (
    <RadixTooltip.Root delayDuration={delayDuration}>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>

      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={side}
          sideOffset={6}
          className="radix-content z-50 rounded-lg border-2 border-bone bg-bone px-3 py-1.5 text-xs font-semibold text-ink"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          {content}
          <RadixTooltip.Arrow className="fill-bone" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}
