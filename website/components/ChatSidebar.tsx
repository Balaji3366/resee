import { Trash2 } from "lucide-react";
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
    <aside className="flex h-full w-80 flex-col rounded-[30px] border border-[#D4AF37]/20 bg-white p-6 shadow-[0_20px_70px_rgba(10,59,46,.08)]">

      {/* New Chat */}
      <button
        onClick={onNewChat}
        className="mb-6 w-full rounded-2xl bg-gradient-to-r from-[#0A3B2E] to-[#14532D] py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
        >
        + New Chat
        </button>

      {/* Heading */}
      <h3 className="mb-4 text-2xl font-bold text-[#06281F]">
        Recent Chats
      </h3>

      {/* Chat List */}
      <div
        className="flex-1 overflow-y-auto pr-2 space-y-3"
        style={{ maxHeight: "calc(88vh - 180px)" }}
        >
        {sessions.length === 0 ? (
          <div className="mt-10 text-center text-gray-500">
            No chats yet
          </div>
        ) : (
          sessions.map((session) => (
            <button
            key={session.id}
            onClick={() => onChatClick(session)}
            className={`w-full rounded-2xl p-4 text-left transition-all duration-300
            ${
              activeChatId === session.id
                ? "border border-[#14532D] bg-[#EEF7F2] shadow-md"
                : "border border-[#D4AF37]/20 bg-white hover:border-[#D4AF37] hover:bg-[#F8FAF8]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="truncate text-sm font-semibold text-[#06281F]">
                    💬 {session.title}
                </span>

                <Trash2
                    size={16}
                    className="cursor-pointer text-gray-400 transition hover:text-red-600"
                    onClick={(e) => {
                        e.stopPropagation();
                        console.log("Delete clicked", session);
                        onDeleteClick(session);
                    }}
                    />
                </div>

              <p className="mt-1 text-xs text-gray-500">
                {new Date(session.created_at).toLocaleDateString()}
              </p>
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="mt-5 rounded-2xl border border-[#D4AF37]/20 bg-[#F8FAF8] p-4">
        <p className="text-sm font-semibold text-[#06281F]">
          Mentora AI
        </p>

        <p className="text-xs text-gray-500">
          Personal Career Mentor
        </p>
      </div>
    
    </aside>
  );
}