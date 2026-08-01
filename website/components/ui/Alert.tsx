import { Info, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import type { ReactNode } from "react";

type AlertVariant = "info" | "success" | "warning" | "error";

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
}

const VARIANT_CONFIG: Record<
  AlertVariant,
  { icon: typeof Info; classes: string; iconClass: string }
> = {
  info: {
    icon: Info,
    classes: "border-amber-dim/30 bg-amber-dim/[0.06]",
    iconClass: "text-amber-dim",
  },
  success: {
    icon: CheckCircle2,
    classes: "border-green-500/30 bg-green-500/[0.06]",
    iconClass: "text-green-600",
  },
  warning: {
    icon: AlertTriangle,
    classes: "border-teal-dim/40 bg-teal/[0.1]",
    iconClass: "text-teal-dim",
  },
  error: {
    icon: XCircle,
    classes: "border-red-500/30 bg-red-500/[0.06]",
    iconClass: "text-red-600",
  },
};

/**
 * Inline, persistent page-level banner — distinct from Toast (transient,
 * corner-anchored via sonner) and from ErrorState (a full section/page
 * failure state with a retry action).
 */
export default function Alert({ variant = "info", title, children, className = "" }: AlertProps) {
  const { icon: Icon, classes, iconClass } = VARIANT_CONFIG[variant];

  return (
    <div role="alert" className={`flex gap-3 rounded-2xl border-2 p-4 ${classes} ${className}`}>
      <Icon size={20} className={`mt-0.5 shrink-0 ${iconClass}`} />

      <div className="text-sm text-bone">
        {title && <p className="mb-1 font-bold">{title}</p>}
        {children}
      </div>
    </div>
  );
}
