import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Title + subtitle + optional right-side action slot — the pattern
 * already repeated inline across the app (Jobs page header, Dashboard
 * Overview header, etc.). Existing inline instances are not migrated to
 * this in this pass.
 */
export default function SectionHeader({
  title,
  subtitle,
  action,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`mb-6 flex items-start justify-between gap-4 ${className}`}>
      <div>
        <h2 className="font-display text-2xl font-extrabold text-bone">{title}</h2>
        {subtitle && <p className="mt-1.5 text-sm text-slate">{subtitle}</p>}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
