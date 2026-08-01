import type { ReactNode } from "react";
import { X } from "lucide-react";
import IconBadge from "@/components/ui/IconBadge";

export interface NotificationProps {
  icon?: ReactNode;
  title: string;
  message?: string;
  timestamp?: string;
  read?: boolean;
  onDismiss?: () => void;
  onClick?: () => void;
  className?: string;
}

/**
 * Pure rendering primitive for a single notification row — icon,
 * title/message, timestamp, unread dot, optional dismiss. Deliberately
 * has no data source: there is no `notifications` table in the schema
 * yet (see docs/standards/design-system.md), so this ships as a
 * presentational component only, the same status as EmptyState/
 * ErrorState — callers supply real data once a Notification Service
 * exists.
 */
export default function Notification({
  icon,
  title,
  message,
  timestamp,
  read = true,
  onDismiss,
  onClick,
  className = "",
}: NotificationProps) {
  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      onClick={onClick}
      className={`relative flex w-full items-start gap-3 rounded-2xl border-2 p-4 text-left transition-colors ${
        read ? "border-bone/10 bg-panel" : "border-bone/15 bg-panel-2/60"
      } ${onClick ? "hover:border-bone/25" : ""} ${className}`}
    >
      {!read && (
        <span
          className="absolute left-2.5 top-2.5 h-2 w-2 rounded-full bg-amber"
          aria-hidden="true"
        />
      )}

      {icon && (
        <IconBadge tone="soft" size={40}>
          {icon}
        </IconBadge>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-bone">{title}</p>
        {message && <p className="mt-0.5 text-sm text-slate">{message}</p>}
        {timestamp && <p className="mt-1.5 text-xs text-slate/70">{timestamp}</p>}
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate transition hover:bg-panel-2 hover:text-bone"
        >
          <X size={14} />
          <span className="sr-only">Dismiss</span>
        </button>
      )}
    </Wrapper>
  );
}
