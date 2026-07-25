import { Bot } from "lucide-react";
export default function ChatHeader() {
  return (
    <div className="border-b border-[#D4AF37]/20 bg-white px-8 py-5">
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0A3B2E] to-[#14532D] text-white shadow-[0_10px_25px_rgba(10,59,46,.18)]">
          <Bot size={28} strokeWidth={2.2} />
        </div>

        {/* Title */}
        <div>
          <h2 className="text-2xl font-bold text-[#06281F]">
            Mentora AI Assistant
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Your personal AI career mentor, ready to help 24/7.
          </p>
        </div>

        {/* Status */}
        <div className="ml-auto flex items-center gap-2 rounded-full bg-[#EEF7F2] px-4 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500"></span>

          <span className="text-sm font-semibold text-[#0A3B2E]">
            Online
          </span>
        </div>
      </div>
    </div>
  );
}