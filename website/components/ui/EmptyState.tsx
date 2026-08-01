import Link from "next/link";
import type { ReactNode } from "react";
import IconBadge from "@/components/ui/IconBadge";

interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  message?: string;
  actions?: EmptyStateAction[];
  className?: string;
}

/**
 * Consolidates the pattern already shared (independently re-implemented
 * 3 times) by components/jobs/JobEmptyState.tsx,
 * components/progress/ProgressEmptyState.tsx, and
 * components/practice/PracticeEmptyState.tsx — dashed border, centered
 * icon/headline/message, 0-2 action links. Not migrated into those
 * existing call sites this pass.
 */
export default function EmptyState({
  icon,
  title,
  message,
  actions = [],
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-3xl border-2 border-dashed border-bone/15 bg-panel p-10 text-center ${className}`}
    >
      {icon && (
        <div className="mx-auto mb-4 flex justify-center">
          <IconBadge tone="soft" size={56}>
            {icon}
          </IconBadge>
        </div>
      )}

      <h3 className="font-display text-lg font-bold text-bone">{title}</h3>

      {message && <p className="mx-auto mt-2 max-w-sm text-sm text-slate">{message}</p>}

      {actions.length > 0 && (
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {actions.map((action) =>
            action.href ? (
              <Link
                key={action.label}
                href={action.href}
                className="text-sm font-bold text-amber hover:underline"
              >
                {action.label} →
              </Link>
            ) : (
              <button
                key={action.label}
                onClick={action.onClick}
                className="text-sm font-bold text-amber hover:underline"
              >
                {action.label} →
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
