import { Bot, ShieldCheck, Sparkles, Zap } from "lucide-react";

export default function ChatHeader() {
  return (
    <div className="border-b border-[#D4AF37]/20 bg-white px-8 py-5">
      <div className="flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#06281F] via-[#0A3B2E] to-[#14532D] text-white shadow-xl">
            <Bot size={30} strokeWidth={2.2} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black tracking-tight text-[#06281F]">
                RESEE AI
              </h2>

              <span className="rounded-full bg-[#D4AF37]/20 px-2 py-1 text-xs font-bold text-[#8A6A00]">
                BETA
              </span>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              See Your Future with your personal AI Career Assistant.
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="hidden items-center gap-3 lg:flex">
          {/* Secure */}
          <div className="flex items-center gap-2 rounded-xl bg-[#EEF7F2] px-4 py-2">
            <ShieldCheck
              size={18}
              className="text-emerald-600"
            />

            <span className="text-sm font-semibold text-[#06281F]">
              Secure
            </span>
          </div>

          {/* AI Powered */}
          <div className="flex items-center gap-2 rounded-xl bg-[#EEF7F2] px-4 py-2">
            <Sparkles
              size={18}
              className="text-[#D4AF37]"
            />

            <span className="text-sm font-semibold text-[#06281F]">
              AI Powered
            </span>
          </div>

          {/* Fast */}
          <div className="flex items-center gap-2 rounded-xl bg-[#EEF7F2] px-4 py-2">
            <Zap
              size={18}
              className="text-amber-500"
            />

            <span className="text-sm font-semibold text-[#06281F]">
              Fast
            </span>
          </div>

          {/* Online */}
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500"></span>

            <span className="text-sm font-semibold text-emerald-700">
              Online
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}