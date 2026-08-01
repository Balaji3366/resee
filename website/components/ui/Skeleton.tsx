interface SkeletonProps {
  className?: string;
  /** "text" for a rounded text-line bar, "block" for a generic rectangular/card placeholder, "circle" for an avatar-shaped placeholder. */
  shape?: "text" | "block" | "circle";
}

/**
 * Shape-matching loading placeholder — the primitive the 15 existing
 * hand-rolled `animate-pulse` blocks across the codebase (e.g.
 * DashboardGoalCard.tsx, DashboardAchievements.tsx) should migrate to
 * over time. Not migrated in this pass. Compose multiple Skeletons to
 * match a real layout, e.g.:
 *   <Skeleton shape="circle" className="h-12 w-12" />
 *   <Skeleton shape="text" className="mt-2 h-4 w-3/4" />
 */
export default function Skeleton({ className = "", shape = "block" }: SkeletonProps) {
  const shapeClass =
    shape === "circle" ? "rounded-full" : shape === "text" ? "rounded-md" : "rounded-2xl";

  return <div className={`animate-pulse bg-panel-2 ${shapeClass} ${className}`} />;
}
