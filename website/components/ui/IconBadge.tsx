import type { ReactNode } from "react";

type IconBadgeColor = "amber" | "amber-dim" | "teal" | "bone";
type IconBadgeShape = "circle" | "square";
type IconBadgeTone = "solid" | "soft";

interface IconBadgeProps {
  children: ReactNode;
  color?: IconBadgeColor;
  shape?: IconBadgeShape;
  tone?: IconBadgeTone;
  size?: number;
  className?: string;
}

const SOLID_CLASSES: Record<IconBadgeColor, string> = {
  amber: "bg-amber text-ink",
  "amber-dim": "bg-amber-dim text-ink",
  teal: "bg-teal text-bone",
  bone: "bg-bone text-ink",
};

const SOFT_CLASSES: Record<IconBadgeColor, string> = {
  amber: "bg-amber/10 text-amber",
  "amber-dim": "bg-amber-dim/10 text-amber-dim",
  teal: "bg-teal/15 text-teal-dim",
  bone: "bg-panel-2 text-bone",
};

/**
 * Every icon in the ReSee v5 design handoff sits inside a colored badge —
 * "never a bare icon floating on white" per the README. Use `tone="solid"`
 * for hero/feature icons and `tone="soft"` for the smaller stat-tile icons.
 */
export default function IconBadge({
  children,
  color = "amber",
  shape = "square",
  tone = "soft",
  size = 52,
  className = "",
}: IconBadgeProps) {
  const toneClasses = tone === "solid" ? SOLID_CLASSES[color] : SOFT_CLASSES[color];
  const shapeClass = shape === "circle" ? "rounded-full" : "rounded-2xl";

  return (
    <div
      className={`flex shrink-0 items-center justify-center ${shapeClass} ${toneClasses} ${className}`}
      style={{ width: size, height: size }}
    >
      {children}
    </div>
  );
}
