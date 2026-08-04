import { Trash2, Plus, Bot, MessageSquareText, Sparkles } from "lucide-react";
import { ChatSession } from "@/types/chat";

type Props = {
  sessions: ChatSession[];
  onDeleteClick: (chat: ChatSession) => void;
  onChatClick: (chat: ChatSession) => void;
  onNewChat: () => void;
  activeChatId: string | null;
};

export default function ChatSidebar({
  sessions,
  onDeleteClick,
  onChatClick,
  onNewChat,
  activeChatId,
}: Props) {
  return (
    <aside className="flex h-full w-80 flex-col overflow-hidden rounded-[32px] border border-amber/20 bg-panel shadow-[0_20px_70px_rgba(10,59,46,.08)]">
      {/* Top Section */}
      <div className="border-b border-amber/20 bg-gradient-to-br from-bone via-amber to-amber-dim p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-panel/10 backdrop-blur">
            <Bot size={28} />
          </div>

          <div>
            <h2 className="font-display text-2xl font-black tracking-tight">RESEE</h2>

            <p className="text-sm text-white/80">See Your Future</p>
          </div>
        </div>

        <button
          onClick={onNewChat}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-amber py-3 font-bold text-bone transition-all duration-300 hover:scale-[1.02]"
        >
          <Plus size={18} />
          New Conversation
        </button>
      </div>

      {/* Recent Chats */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="mb-4 flex items-center gap-2">
          <MessageSquareText size={18} className="text-amber" />

          <h3 className="font-bold text-bone">Recent Conversations</h3>
        </div>

        {sessions.length === 0 ? (
          <div className="mt-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-panel">
              <Bot size={28} className="text-amber" />
            </div>

            <h4 className="mt-5 font-bold text-bone">No conversations yet</h4>

            <p className="mt-2 text-sm leading-6 text-slate">
              Start your first conversation with RESEE AI.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onChatClick(session)}
                className={`group w-full rounded-2xl border p-4 text-left transition-all duration-300 ${
                  activeChatId === session.id
                    ? "border-amber-dim bg-panel shadow-lg ring-1 ring-amber-dim/10"
                    : "border-amber/20 bg-panel hover:border-amber hover:-translate-y-0.5 hover:shadow-lg"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="truncate font-semibold text-bone">{session.title}</h4>

                      {session.mode === "career_coach" && (
                        <span className="shrink-0 rounded-full bg-amber-dim/10 px-2 py-0.5 text-[10px] font-bold text-amber-dim">
                          Coach
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-slate">
                      {new Date(session.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <Trash2
                    size={16}
                    className="shrink-0 cursor-pointer opacity-0 transition-all duration-200 group-hover:opacity-100 text-slate hover:text-red-500"
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-amber/20 bg-ink p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber text-white">
            <Sparkles size={18} />
          </div>

          <div>
            <h4 className="font-semibold text-bone">RESEE AI</h4>

            <p className="text-xs text-slate">See Your Future</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
