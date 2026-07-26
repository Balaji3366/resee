export type ChatMessage = {
  sender: "AI" | "You";
  text: string;

  attachmentName?: string | null;
  attachmentUrl?: string | null;
  attachmentType?: string | null;
  attachmentSize?: number | null;
};

export type ChatSession = {
  id: string;
  title: string;
  created_at: string;
};