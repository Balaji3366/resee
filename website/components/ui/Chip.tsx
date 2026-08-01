import type { ReactNode } from "react";

interface ChipProps {
  children: ReactNode;
  selected?: boolean;
  className?: string;
}

/**
 * Pill tag/filter-chip — selected state is a solid coral fill+border,
 * unselected is a light-bordered white pill, per the design handoff.
 * Purely presentational; wrap in a <button> for interactive filter chips.
 */
export default function Chip({ children, selected = false, className = "" }: ChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
        selected
          ? "border-2 border-amber bg-amber text-ink"
          : "border-2 border-bone/15 bg-panel text-bone"
      } ${className}`}
    >
      {children}
    </span>
  );
}
