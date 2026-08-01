import type { ReactNode } from "react";

type BadgeVariant = "neutral" | "amber" | "success" | "warning" | "error";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  neutral: "bg-panel-2 text-slate",
  amber: "bg-amber/10 text-amber",
  success: "bg-green-500/10 text-green-600",
  warning: "bg-teal/15 text-teal-dim",
  error: "bg-red-500/10 text-red-600",
};

/**
 * Small, non-interactive status/count indicator — e.g. "LIVE", "Coming
 * Soon", a notification count. Distinct from Chip.tsx, which is an
 * interactive filter/selection pill with a selected/unselected state.
 */
export default function Badge({ children, variant = "neutral", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
