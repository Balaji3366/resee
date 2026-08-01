"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, FileText, History, Sparkles, TrendingUp, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

type DashboardHeroProps = {
  resumeCount: number;
  documentCount: number;
};

export default function DashboardHero({ resumeCount, documentCount }: DashboardHeroProps) {
  const router = useRouter();

  return (
    <section
      className="animate-fade-up relative overflow-hidden rounded-[32px] p-8 lg:p-12"
      style={{
        animationDelay: "0.1s",
        background: "linear-gradient(135deg, var(--color-amber-dim), var(--color-bone) 60%)",
      }}
    >
      {/* Background Glow */}

      <div
        className="absolute -top-24 -right-14 h-72 w-72 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(255,107,74,0.3), transparent 70%)" }}
      />

      <div className="relative grid items-center gap-12 lg:grid-cols-2">
        {/* LEFT */}

        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-ink/15 px-4 py-2 text-sm font-bold text-ink">
            <Sparkles size={15} />
            RESEE AI Career OS
          </span>

          <h1 className="font-display mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-ink lg:text-6xl">
            Welcome back.
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-ink/75">
            Talk to RESEE AI, analyse your resume, organise your documents, and prepare for
            interviews — all in one workspace.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-full bg-ink/10 px-4 py-2 text-sm font-medium text-ink">
              <CheckCircle2 size={16} className="text-amber" />
              AI Career Chat · ATS Resume Analysis · Smart Documents
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => router.push("/chat")}
              className="flex items-center gap-2 rounded-full bg-amber px-7 py-4 font-bold text-ink transition duration-200 hover:scale-105"
            >
              <FileText size={18} />
              Open AI Chat
            </button>

            <button
              onClick={() => router.push("/resume")}
              className="flex items-center gap-2 rounded-full border-2 border-ink/40 px-6 py-4 font-semibold text-ink transition hover:bg-ink/10"
            >
              <History size={18} />
              Analyse Resume
            </button>
          </div>
        </motion.div>

        {/* RIGHT */}

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="rounded-3xl border border-ink/15 bg-ink/[0.08] p-7"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-ink">Your AI Workspace</h3>
            <TrendingUp className="text-amber" size={20} />
          </div>

          <div className="mt-6 flex flex-col gap-5">
            <div>
              <div className="mb-2 flex justify-between text-[13px] text-ink/70">
                <span>Resume Analyses</span>
                <span className="font-bold text-ink">{resumeCount}</span>
              </div>

              <div className="h-1.5 rounded-full bg-ink/15">
                <div className="h-1.5 rounded-full bg-amber" style={{ width: "90%" }} />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-[13px] text-ink/70">
                <span>Documents</span>
                <span className="font-bold text-ink">{documentCount}</span>
              </div>

              <div className="h-1.5 rounded-full bg-ink/15">
                <div className="h-1.5 rounded-full bg-teal" style={{ width: "60%" }} />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-[13px] text-ink/70">
                <span>RESEE AI</span>
                <span className="font-bold text-teal">Ready</span>
              </div>

              <div className="h-1.5 rounded-full bg-ink/15">
                <div className="h-1.5 rounded-full bg-teal" style={{ width: "100%" }} />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-[13px] text-ink/70">
                <span>Career Progress</span>
                <span className="font-bold text-amber">78%</span>
              </div>

              <div className="h-1.5 rounded-full bg-ink/15">
                <div className="h-1.5 rounded-full bg-amber" style={{ width: "78%" }} />
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push("/documents")}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3.5 font-bold text-bone transition hover:scale-[1.02]"
          >
            Open Documents
            <ArrowRight size={18} />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
