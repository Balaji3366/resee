"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Hero() {
  const router = useRouter();

  async function handleLaunchWorkspace() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-br from-[#06281F] via-[#0A3B2E] to-[#14532D] pt-36 pb-24"
    >
      {/* Background Glow */}

      <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-[#D4AF37]/20 blur-[150px]" />

      <div className="absolute -right-20 bottom-10 h-96 w-96 rounded-full bg-emerald-500/20 blur-[150px]" />

      <div className="mx-auto flex max-w-7xl flex-col items-center gap-20 px-6 lg:flex-row lg:px-12">

        {/* LEFT */}

        <div className="flex-1">

          <div className="mb-6 inline-flex items-center rounded-full border border-[#D4AF37]/30 bg-white/10 px-5 py-2 text-sm font-medium text-[#F5E7A1] backdrop-blur-md">
            ✨ Your AI Career Mentor
          </div>

          <h1 className="text-5xl font-extrabold leading-tight text-white md:text-7xl">
            Plan.
            <br />
            Learn.
            <br />
            <span className="text-[#D4AF37]">
              Practice.
            </span>
            <br />
            Get Hired.
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-8 text-gray-200">
            Mentora is your AI-powered Career Operating System.
            Analyse resumes, prepare interviews,
            build personalized roadmaps,
            improve skills and land your dream job.
          </p>

          <div className="mt-10 flex flex-wrap gap-5">

            <button
              onClick={handleLaunchWorkspace}
              className="rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] px-8 py-4 font-semibold text-[#06281F] shadow-xl transition duration-300 hover:-translate-y-1 hover:scale-105"
            >
              Get Started Free →
            </button>

            <button
              onClick={() => {
                document
                  .getElementById("features")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });
              }}
              className="rounded-xl border border-[#D4AF37] px-8 py-4 font-semibold text-[#D4AF37] transition hover:bg-[#D4AF37] hover:text-[#06281F]"
            >
              Explore Features
            </button>

          </div>

          <div className="mt-12 flex flex-wrap items-center gap-8 text-gray-300">

            <div>
              ⭐⭐⭐⭐⭐
            </div>

            <div>
              Trusted by{" "}
              <b className="text-white">
                10,000+
              </b>{" "}
              learners
            </div>

          </div>

        </div>

        {/* RIGHT */}

        <div className="flex-1">

          <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-8 backdrop-blur-2xl shadow-[0_25px_80px_rgba(0,0,0,0.35)]">

            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#D4AF37]/10 blur-3xl" />

            <div className="absolute -bottom-12 -left-10 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl" />

            <h2 className="text-2xl font-bold text-white">
              Today's Career Dashboard
            </h2>

            <p className="mt-2 text-gray-300">
              Track your AI-powered career progress.
            </p>

            {/* Dashboard Cards Start */}
                        <div className="mt-8 grid grid-cols-2 gap-5">

              {/* Resume Analysis */}

              <div className="group rounded-3xl bg-white p-5 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">

                <div className="flex items-center justify-between">

                  <p className="text-sm font-medium text-gray-500">
                    Resume Analysis
                  </p>

                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700">
                    LIVE
                  </span>

                </div>

                <h3 className="mt-3 text-4xl font-extrabold text-[#14532D]">
                  92%
                </h3>

                <div className="mt-5 h-2 rounded-full bg-gray-100">
                  <div className="h-2 w-[92%] rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600" />
                </div>

              </div>

              {/* Mock Interviews */}

              <div className="group rounded-3xl bg-white p-5 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">

                <p className="text-sm font-medium text-gray-500">
                  Mock Interviews
                </p>

                <h3 className="mt-3 text-4xl font-extrabold text-[#14532D]">
                  12
                </h3>

                <p className="mt-5 text-sm font-semibold text-emerald-600">
                  ↗ +3 This Week
                </p>

              </div>

              {/* Career Score */}

              <div className="group rounded-3xl bg-white p-5 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">

                <p className="text-sm font-medium text-gray-500">
                  Career Score
                </p>

                <h3 className="mt-3 text-2xl font-extrabold text-[#14532D]">
                  Excellent
                </h3>

                <div className="mt-5 h-2 rounded-full bg-gray-100">
                  <div className="h-2 w-[88%] rounded-full bg-gradient-to-r from-[#D4AF37] to-yellow-400" />
                </div>

              </div>

              {/* AI Roadmap */}

              <div className="group rounded-3xl bg-white p-5 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">

                <p className="text-sm font-medium text-gray-500">
                  AI Roadmap
                </p>

                <h3 className="mt-3 text-xl font-extrabold text-[#14532D]">
                  Ready
                </h3>

                <div className="mt-5 flex items-center gap-2">

                  <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-500" />

                  <span className="text-sm font-semibold text-emerald-600">
                    AI Ready
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}