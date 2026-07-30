import { Check, Loader2, AlertCircle } from "lucide-react";
import type { AutosaveStatus } from "@/hooks/useResumeAutosave";

export default function AutosaveIndicator({ status }: { status: AutosaveStatus }) {
  if (status === "idle") return null;

  if (status === "saving") {
    return (
      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate">
        <Loader2 size={14} className="animate-spin" /> Saving...
      </span>
    );
  }

  if (status === "error") {
    return (
      <span className="flex items-center gap-1.5 text-xs font-semibold text-red-500">
        <AlertCircle size={14} /> Failed to save
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-xs font-semibold text-teal">
      <Check size={14} /> Saved
    </span>
  );
}
