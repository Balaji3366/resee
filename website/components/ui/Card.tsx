import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Dashed variant for "coming soon / locked" content, per the design handoff. */
  dashed?: boolean;
  /**
   * The design language is deliberately flat (ink border, no shadow) —
   * `elevated` is only for the rare case a card needs to float above
   * other content (e.g. a menu), using the design system's `--shadow-sm`
   * token rather than an ad hoc shadow value.
   */
  elevated?: boolean;
  as?: "div" | "section";
}

/**
 * The signature ReSee v5 card: solid ink border, generous rounding, no
 * soft shadow by default. See Design baseline recreation priority/
 * design_handoff_v5_redesign/README.md's "Shape & Structure" section.
 */
export default function Card({
  children,
  className = "",
  dashed = false,
  elevated = false,
  as = "div",
}: CardProps) {
  const Component = as;

  return (
    <Component
      className={`rounded-3xl bg-panel ${
        dashed ? "border-2 border-dashed border-bone/20" : "border-2 border-bone"
      } ${className}`}
      style={elevated ? { boxShadow: "var(--shadow-sm)" } : undefined}
    >
      {children}
    </Component>
  );
}
