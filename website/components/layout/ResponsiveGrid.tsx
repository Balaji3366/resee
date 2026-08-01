import type { ReactNode } from "react";

interface ResponsiveGridProps {
  children: ReactNode;
  cols?: { base?: number; sm?: number; md?: number; lg?: number; xl?: number };
  gap?: number;
  className?: string;
}

const COL_CLASS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
};
const SM_COL_CLASS: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
};
const MD_COL_CLASS: Record<number, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
};
const LG_COL_CLASS: Record<number, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
};
const XL_COL_CLASS: Record<number, string> = {
  1: "xl:grid-cols-1",
  2: "xl:grid-cols-2",
  3: "xl:grid-cols-3",
  4: "xl:grid-cols-4",
  5: "xl:grid-cols-5",
  6: "xl:grid-cols-6",
};

// Tailwind's scanner needs literal class strings, not runtime-interpolated
// ones (`gap-${gap}` would never get generated) — a lookup map, same as
// the column classes above.
const GAP_CLASS: Record<number, string> = {
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  8: "gap-8",
};

/**
 * Thin wrapper generating the responsive grid classes already
 * hand-written ad hoc across the app (e.g. `grid gap-6 sm:grid-cols-2
 * xl:grid-cols-4` in components/Dashboard.tsx). Existing call sites are
 * not migrated to this in this pass — Tailwind classes are static, so
 * every combination this component might need is pre-written above
 * rather than generated at runtime (which Tailwind can't pick up).
 */
export default function ResponsiveGrid({
  children,
  cols = {},
  gap = 6,
  className = "",
}: ResponsiveGridProps) {
  const classes = [
    "grid",
    GAP_CLASS[gap] ?? GAP_CLASS[6],
    cols.base ? COL_CLASS[cols.base] : undefined,
    cols.sm ? SM_COL_CLASS[cols.sm] : undefined,
    cols.md ? MD_COL_CLASS[cols.md] : undefined,
    cols.lg ? LG_COL_CLASS[cols.lg] : undefined,
    cols.xl ? XL_COL_CLASS[cols.xl] : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={`${classes} ${className}`}>{children}</div>;
}
