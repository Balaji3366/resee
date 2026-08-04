import { Bot, Sparkles } from "lucide-react";
import type { WorkspaceMode } from "@/types/chat";

type Props = {
  mode: WorkspaceMode;
  onChange: (mode: WorkspaceMode) => void;
  disabled?: boolean;
};

/**
 * Mode picker for a brand-new AI Workspace conversation. Only shown
 * before the first message of a new session — mode is fixed for the
 * lifetime of a session (docs/architecture/ai-workspace-architecture.md
 * §4.2), so once a conversation has started this control is hidden
 * rather than allowed to change what an in-progress session bills as.
 */
export default function ChatModeSwitch({ mode, onChange, disabled }: Props) {
  return (
    <div className="mb-3 flex items-center gap-2 rounded-2xl border border-amber/20 bg-panel p-1.5">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange("general")}
        className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
          mode === "general"
            ? "bg-gradient-to-r from-amber to-amber-dim text-white shadow"
            : "text-slate hover:text-bone"
        }`}
      >
        <Bot size={16} />
        General Assistant
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange("career_coach")}
        className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
          mode === "career_coach"
            ? "bg-gradient-to-r from-amber to-amber-dim text-white shadow"
            : "text-slate hover:text-bone"
        }`}
      >
        <Sparkles size={16} />
        Career Coach
      </button>
    </div>
  );
}
