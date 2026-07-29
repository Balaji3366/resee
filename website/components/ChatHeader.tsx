import { Bot, ShieldCheck, Sparkles, Zap } from "lucide-react";

export default function ChatHeader() {
  return (
    <div className="border-b border-amber/20 bg-panel px-8 py-5">
      <div className="flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-bone via-amber to-amber-dim text-white shadow-xl">
            <Bot size={30} strokeWidth={2.2} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-2xl font-black tracking-tight text-bone">
                RESEE AI
              </h2>

              <span className="rounded-full bg-amber/20 px-2 py-1 text-xs font-bold text-amber">
                BETA
              </span>
            </div>

            <p className="mt-1 text-sm text-slate">
              See Your Future with your personal AI Career Assistant.
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="hidden items-center gap-3 lg:flex">
          {/* Secure */}
          <div className="flex items-center gap-2 rounded-xl bg-panel px-4 py-2">
            <ShieldCheck
              size={18}
              className="text-teal"
            />

            <span className="text-sm font-semibold text-bone">
              Secure
            </span>
          </div>

          {/* AI Powered */}
          <div className="flex items-center gap-2 rounded-xl bg-panel px-4 py-2">
            <Sparkles
              size={18}
              className="text-amber"
            />

            <span className="text-sm font-semibold text-bone">
              AI Powered
            </span>
          </div>

          {/* Fast */}
          <div className="flex items-center gap-2 rounded-xl bg-panel px-4 py-2">
            <Zap
              size={18}
              className="text-amber-500"
            />

            <span className="text-sm font-semibold text-bone">
              Fast
            </span>
          </div>

          {/* Online */}
          <div className="flex items-center gap-2 rounded-xl bg-panel-2 px-4 py-2">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-teal"></span>

            <span className="text-sm font-semibold text-teal">
              Online
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}