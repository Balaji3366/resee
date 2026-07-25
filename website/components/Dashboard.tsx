"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import BackButton from "@/components/BackButton";

export default function Dashboard() {
  const router = useRouter();

  const [resumeCount, setResumeCount] = useState(0);
  const [documentCount, setDocumentCount] = useState(0);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const { count } = await supabase
      .from("resume_history")
      .select("*", {
        count: "exact",
        head: true,
      });

    setResumeCount(count || 0);

    const { data: documentFiles, error: documentError } =
      await supabase.storage
        .from("uploads")
        .list();

    if (documentError) {
      console.error(documentError);
    } else {
      setDocumentCount(documentFiles.length);
    }
  }

  return (
    <section
      id="dashboard"
      className="min-h-screen bg-[#F8FAF8] pt-28 pb-20"
    >
      <div className="mx-auto max-w-7xl px-6">

        {/* Back Button */}

        <div className="mb-10">
          <BackButton  />
        </div>

        {/* Hero */}

        <div className="overflow-hidden rounded-[32px] bg-gradient-to-r from-[#06281F] via-[#0A3B2E] to-[#14532D] p-10 shadow-2xl">

          <span className="rounded-full bg-[#D4AF37]/20 px-4 py-2 text-sm font-semibold text-[#F5D97A]">
            AI CAREER DASHBOARD
          </span>

          <h1 className="mt-6 text-5xl font-extrabold text-white">
            👋 Welcome to Mentora
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-gray-200">
            Your complete AI Career Workspace.
            Analyse resumes, prepare interviews,
            build career roadmaps and accelerate
            your professional growth—all from one place.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">

            <button
              onClick={() => router.push("/resume")}
              className="rounded-xl bg-[#D4AF37] px-7 py-3 font-bold text-[#06281F] transition hover:scale-105"
            >
              📄 Analyse Resume
            </button>

            <button
              onClick={() => router.push("/resume-history")}
              className="rounded-xl border border-[#D4AF37] px-7 py-3 font-semibold text-[#D4AF37] transition hover:bg-[#D4AF37] hover:text-[#06281F]"
            >
              📜 Resume History
            </button>

          </div>

        </div>

        {/* Dashboard Stats */}

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          {/* Resume */}

          <div className="rounded-3xl border border-[#D4AF37]/30 bg-white p-8 shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl">

            <div className="text-5xl">
              📄
            </div>

            <h3 className="mt-5 text-lg font-semibold text-gray-600">
              Resume Reports
            </h3>

            <p className="mt-2 text-5xl font-extrabold text-[#06281F]">
              {resumeCount}
            </p>

          </div>

          {/* Documents */}

          <div className="rounded-3xl border border-emerald-200 bg-white p-8 shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl">

            <div className="text-5xl">
              📚
            </div>

            <h3 className="mt-5 text-lg font-semibold text-gray-600">
              Documents
            </h3>

            <p className="mt-2 text-5xl font-extrabold text-emerald-700">
              {documentCount}
            </p>

          </div>

          {/* Interview */}

          <div className="rounded-3xl border border-[#D4AF37]/30 bg-white p-8 shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl">

            <div className="text-5xl">
              🎤
            </div>

            <h3 className="mt-5 text-lg font-semibold text-gray-600">
              Interviews
            </h3>

            <p className="mt-2 text-5xl font-extrabold text-[#14532D]">
              0
            </p>

            <span className="mt-3 inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
              Coming Soon
            </span>

          </div>

          {/* Roadmaps */}

          <div className="rounded-3xl border border-[#D4AF37]/30 bg-white p-8 shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl">

            <div className="text-5xl">
              🧭
            </div>

            <h3 className="mt-5 text-lg font-semibold text-gray-600">
              Career Roadmaps
            </h3>

            <p className="mt-2 text-5xl font-extrabold text-[#D4AF37]">
              0
            </p>

            <span className="mt-3 inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
              Coming Soon
            </span>

          </div>

        </div>

        {/* Feature Cards */}

        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {/* Resume Analyzer */}

          <div className="rounded-3xl border border-[#D4AF37]/30 bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">

            <div className="mb-5 text-5xl">📄</div>

            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-[#06281F]">
                Resume Analyzer
              </h3>

              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                LIVE
              </span>
            </div>

            <p className="mt-5 leading-7 text-gray-600">
              Analyse your resume with AI, receive an ATS score,
              identify weaknesses and generate a professionally
              improved resume in seconds.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3">

              <button
                onClick={() => router.push("/resume")}
                className="rounded-xl bg-[#0A3B2E] px-5 py-3 font-semibold text-white transition hover:bg-[#14532D]"
              >
                Analyse
              </button>

              <button
                onClick={() => router.push("/resume-history")}
                className="rounded-xl bg-[#D4AF37] px-5 py-3 font-semibold text-[#06281F] transition hover:brightness-110"
              >
                History
              </button>

            </div>

          </div>

          {/* Documents */}

          <div className="rounded-3xl border border-[#D4AF37]/30 bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">

            <div className="mb-5 text-5xl">📚</div>

            <div className="flex items-center justify-between">

              <h3 className="text-2xl font-bold text-[#06281F]">
                Documents
              </h3>

              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                LIVE
              </span>

            </div>

            <p className="mt-5 leading-7 text-gray-600">
              Upload PDFs, organise study material,
              summarise documents and interact with AI.
            </p>

            <button
              onClick={() => router.push("/documents")}
              className="mt-8 w-full rounded-xl bg-[#0A3B2E] py-3 font-semibold text-white transition hover:bg-[#14532D]"
            >
              Open Documents
            </button>

          </div>

          {/* Mock Interview */}

          <div className="rounded-3xl border border-[#D4AF37]/30 bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">

            <div className="mb-5 text-5xl">🎤</div>

            <div className="flex items-center justify-between">

              <h3 className="text-2xl font-bold text-[#06281F]">
                Mock Interview
              </h3>

              <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
                Coming Soon
              </span>

            </div>

            <p className="mt-5 leading-7 text-gray-600">
              Practice HR, technical and behavioural interviews
              with realistic AI feedback.
            </p>

            <button
              className="mt-8 w-full rounded-xl bg-gray-300 py-3 font-semibold text-gray-700 cursor-not-allowed"
            >
              Coming Soon
            </button>

          </div>

          {/* Resume Builder */}

          <div className="rounded-3xl border border-[#D4AF37]/30 bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">

            <div className="mb-5 text-5xl">📝</div>

            <div className="flex items-center justify-between">

              <h3 className="text-2xl font-bold text-[#06281F]">
                Resume Builder
              </h3>

              <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
                Coming Soon
              </span>

            </div>

            <p className="mt-5 leading-7 text-gray-600">
              Build beautiful ATS-friendly resumes
              using premium templates.
            </p>

            <button
              className="mt-8 w-full rounded-xl bg-gray-300 py-3 font-semibold text-gray-700 cursor-not-allowed"
            >
              Coming Soon
            </button>

          </div>

          {/* Career Roadmap */}

          <div className="rounded-3xl border border-[#D4AF37]/30 bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">

            <div className="mb-5 text-5xl">🧭</div>

            <div className="flex items-center justify-between">

              <h3 className="text-2xl font-bold text-[#06281F]">
                Career Roadmap
              </h3>

              <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
                Coming Soon
              </span>

            </div>

            <p className="mt-5 leading-7 text-gray-600">
              Receive personalised learning paths
              and career guidance powered by AI.
            </p>

            <button
              className="mt-8 w-full rounded-xl bg-gray-300 py-3 font-semibold text-gray-700 cursor-not-allowed"
            >
              Coming Soon
            </button>

          </div>

          {/* Skill Gap */}

          <div className="rounded-3xl border border-[#D4AF37]/30 bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">

            <div className="mb-5 text-5xl">📈</div>

            <div className="flex items-center justify-between">

              <h3 className="text-2xl font-bold text-[#06281F]">
                Skill Gap
              </h3>

              <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
                Coming Soon
              </span>

            </div>

            <p className="mt-5 leading-7 text-gray-600">
              Discover missing skills required
              for your dream job and improve faster.
            </p>

            <button
              className="mt-8 w-full rounded-xl bg-gray-300 py-3 font-semibold text-gray-700 cursor-not-allowed"
            >
              Coming Soon
            </button>

          </div>

        </div>

        {/* Footer */}

        <div className="mt-20 border-t border-[#D4AF37]/20 pt-8 text-center">

          <h3 className="text-xl font-bold text-[#06281F]">
            ✨ Mentora
          </h3>

          <p className="mt-3 text-gray-600">
            Your AI Career Mentor.
            Helping students and professionals build
            better careers with Artificial Intelligence.
          </p>

          <p className="mt-6 text-sm text-gray-500">
            © 2026 Mentora. All Rights Reserved.
          </p>

        </div>

      </div>
    </section>
  );
}