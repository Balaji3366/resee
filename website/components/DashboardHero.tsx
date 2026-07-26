"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  FileText,
  History,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  FolderOpen,
  Bot,
} from "lucide-react";
import { motion } from "framer-motion";

type DashboardHeroProps = {
  resumeCount: number;
  documentCount: number;
};

export default function DashboardHero({
  resumeCount,
  documentCount,
}: DashboardHeroProps) {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-[#06281F] via-[#0A3B2E] to-[#14532D] p-8 lg:p-12 shadow-2xl">

      {/* Background Glow */}

      <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-[#D4AF37]/10 blur-3xl" />
      <div className="absolute -bottom-20 left-0 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

      <div className="relative grid items-center gap-12 lg:grid-cols-2">

        {/* LEFT */}

        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >

          <span className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37]/20 px-4 py-2 text-sm font-semibold text-[#F7D978]">
            <Sparkles size={15} />
            RESEE AI Career OS
          </span>

          <h1 className="mt-6 text-5xl font-extrabold leading-tight text-white lg:text-6xl">
            👋 Welcome Back
          </h1>

          <h2 className="mt-4 text-3xl font-bold text-[#F7D978]">
            See Your Future
          </h2>

          <p className="mt-6 max-w-xl text-lg leading-8 text-gray-200">
            Talk to RESEE AI, analyse your resume, organise your documents, prepare for interviews and build your career with one intelligent workspace.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">

            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white">
              <CheckCircle2 size={16} className="text-[#D4AF37]" />
              AI Career Chat
              ATS Resume Analysis
              Smart Documents
            </div>

          </div>

          <div className="mt-10 flex flex-wrap gap-4">

            <button
              onClick={() => router.push("/chat")}
              className="flex items-center gap-2 rounded-2xl bg-[#D4AF37] px-7 py-4 font-bold text-[#06281F] transition duration-300 hover:scale-105"
            >
              <FileText size={20} />
              Open AI Chat
            </button>

            <button
              onClick={() => router.push("/resume")}
              className="flex items-center gap-2 rounded-2xl border border-[#D4AF37] px-7 py-4 font-semibold text-[#F7D978] transition hover:bg-[#D4AF37] hover:text-[#06281F]"
            >
              <History size={20} />
              Analyse Resume
            </button>

          </div>

        </motion.div>

        {/* RIGHT */}

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.7,
            delay: 0.2,
          }}
          className="rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur-xl"
        >

          <div className="flex items-center justify-between">

            <h3 className="text-2xl font-bold text-white">
              Your AI Workspace
            </h3>

            <TrendingUp className="text-[#F7D978]" />
          </div>

          <div className="mt-8 space-y-6">

            <div>

              <div className="mb-2 flex justify-between text-white">
                <span>Resume Analyses</span>
                <span className="font-bold">{resumeCount}</span>
              </div>

              <div className="h-2 rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-[#D4AF37]"
                  style={{ width: "90%" }}
                />
              </div>

            </div>

            <div>

              <div className="mb-2 flex justify-between text-white">
                <span>Documents</span>
                <span className="font-bold">{documentCount}</span>
              </div>

              <div className="h-2 rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-emerald-400"
                  style={{ width: "60%" }}
                />
              </div>

            </div>

            <div>

              <div className="mb-2 flex justify-between text-white">
                <span>RESEE AI</span>
                <span className="font-bold text-emerald-300">
                  Ready
                </span>
              </div>

              <div className="h-2 rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-emerald-400"
                  style={{ width: "100%" }}
                />
              </div>

            </div>

            <div>

              <div className="mb-2 flex justify-between text-white">
                <span>Career Progress</span>
                <span className="font-bold text-[#F7D978]">
                  78%
                </span>
              </div>

              <div className="h-2 rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-[#D4AF37]"
                  style={{ width: "78%" }}
                />
              </div>

            </div>

          </div>

          <button
            onClick={() => router.push("/documents")}
            className="mt-10 flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-4 font-bold text-[#06281F] transition hover:scale-[1.02]"
          >
            Open Documents
            <ArrowRight size={18} />
          </button>

        </motion.div>

      </div>

    </section>
  );
}