export type WorkspaceMode = "general" | "career_coach";

export type ChatMessage = {
  sender: "AI" | "You";
  text: string;

  attachmentName?: string | null;
  attachmentUrl?: string | null;
  attachmentType?: string | null;
  attachmentSize?: number | null;

  /** Set only on a synthetic AI-slot entry representing a failed turn —
   *  when present, ChatMessages renders AIErrorState/AICreditExhaustedState
   *  instead of markdown text for this entry. */
  errorCode?: string | null;
  errorMessage?: string | null;
};

export type ChatSession = {
  id: string;
  title: string;
  created_at: string;
  mode: WorkspaceMode;
  credit_charged_at?: string | null;
};
