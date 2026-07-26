import {
  Trash2,
  Plus,
  Bot,
  MessageSquareText,
  Sparkles,
} from "lucide-react";
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
    <aside className="flex h-full w-80 flex-col overflow-hidden rounded-[32px] border border-[#D4AF37]/20 bg-white shadow-[0_20px_70px_rgba(10,59,46,.08)]">
      {/* Top Section */}
      <div className="border-b border-[#D4AF37]/20 bg-gradient-to-br from-[#06281F] via-[#0A3B2E] to-[#14532D] p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
            <Bot size={28} />
          </div>

          <div>
            <h2 className="text-2xl font-black tracking-tight">
              RESEE
            </h2>

            <p className="text-sm text-white/80">
              See Your Future
            </p>
          </div>
        </div>

        <button
          onClick={onNewChat}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#D4AF37] py-3 font-bold text-[#06281F] transition-all duration-300 hover:scale-[1.02]"
        >
          <Plus size={18} />
          New Conversation
        </button>
      </div>

      {/* Recent Chats */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="mb-4 flex items-center gap-2">
          <MessageSquareText
            size={18}
            className="text-[#0A3B2E]"
          />

          <h3 className="font-bold text-[#06281F]">
            Recent Conversations
          </h3>
        </div>

        {sessions.length === 0 ? (
          <div className="mt-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF7F2]">
              <Bot
                size={28}
                className="text-[#0A3B2E]"
              />
            </div>

            <h4 className="mt-5 font-bold text-[#06281F]">
              No conversations yet
            </h4>

            <p className="mt-2 text-sm leading-6 text-gray-500">
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
                    ? "border-[#14532D] bg-[#EEF7F2] shadow-lg ring-1 ring-[#14532D]/10"
                    : "border-[#D4AF37]/20 bg-white hover:border-[#D4AF37] hover:-translate-y-0.5 hover:shadow-lg"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate font-semibold text-[#06281F]">
                      {session.title}
                    </h4>

                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(session.created_at).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>

                  <Trash2
                  size={16}
                  className="shrink-0 cursor-pointer opacity-0 transition-all duration-200 group-hover:opacity-100 text-gray-400 hover:text-red-500"
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[#D4AF37]/20 bg-[#F8FAF8] p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0A3B2E] text-white">
            <Sparkles size={18} />
          </div>

          <div>
            <h4 className="font-semibold text-[#06281F]">
              RESEE AI
            </h4>

            <p className="text-xs text-gray-500">
              See Your Future
            </p>
          </div>
        </div>

         </div>
    </aside>
  );
}