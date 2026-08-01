import { AlertTriangle, WifiOff } from "lucide-react";
import Button from "@/components/ui/Button";
import IconBadge from "@/components/ui/IconBadge";

interface ErrorStateProps {
  title?: string;
  message?: string;
  /** Distinct icon/copy framing for a connectivity failure vs. a generic error. */
  variant?: "generic" | "offline";
  onRetry?: () => void;
  className?: string;
}

/**
 * A section/page failure state with a retry action — distinct from
 * EmptyState's "nothing here yet" framing. Also covers what the Sprint 2
 * brief calls "Retry UI"/"Network Error UI"/"API Error UI"/"Offline UI":
 * those are variants/props of this one component, not separate pages.
 */
export default function ErrorState({
  title,
  message,
  variant = "generic",
  onRetry,
  className = "",
}: ErrorStateProps) {
  const isOffline = variant === "offline";

  return (
    <div className={`rounded-3xl border-2 border-bone bg-panel p-10 text-center ${className}`}>
      <div className="mx-auto mb-4 flex justify-center">
        <IconBadge color="amber" tone="soft" size={56}>
          {isOffline ? <WifiOff size={26} /> : <AlertTriangle size={26} />}
        </IconBadge>
      </div>

      <h3 className="font-display text-lg font-bold text-bone">
        {title ?? (isOffline ? "You're offline" : "Something went wrong")}
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm text-slate">
        {message ??
          (isOffline
            ? "Check your connection and try again."
            : "We couldn't load this. Try again in a moment.")}
      </p>

      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-5">
          Try again
        </Button>
      )}
    </div>
  );
}
