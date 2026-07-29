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
      className="relative overflow-hidden bg-gradient-to-br from-bone via-amber to-amber-dim pt-36 pb-24"
    >
      {/* Background Glow */}

      <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-amber/20 blur-[150px]" />

      <div className="absolute -right-20 bottom-10 h-96 w-96 rounded-full bg-teal/20 blur-[150px]" />

      <div className="mx-auto flex max-w-7xl flex-col items-center gap-20 px-6 lg:flex-row lg:px-12">

        {/* LEFT */}

        <div className="flex-1">

          <div className="mb-6 inline-flex items-center rounded-full border border-amber/30 bg-panel/10 px-5 py-2 text-sm font-medium text-amber backdrop-blur-md">
            ✨ Your AI Career Mentor
          </div>

          <h1 className="font-display text-5xl font-extrabold leading-tight text-white md:text-7xl">
            Plan.
            <br />
            Learn.
            <br />
            <span className="text-amber">
              Practice.
            </span>
            <br />
            Get Hired.
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-8 text-bone/70">
            RESEE is your AI-powered Career Operating System.
            Analyse resumes, prepare interviews,
            build personalized roadmaps,
            improve skills and land your dream job.
          </p>

          <div className="mt-10 flex flex-wrap gap-5">

            <button
              onClick={handleLaunchWorkspace}
              className="rounded-xl bg-gradient-to-r from-amber to-amber-dim px-8 py-4 font-semibold text-bone shadow-xl transition duration-300 hover:-translate-y-1 hover:scale-105"
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
              className="rounded-xl border border-amber px-8 py-4 font-semibold text-amber transition hover:bg-amber hover:text-bone"
            >
              Explore Features
            </button>

          </div>

          <div className="mt-12 flex flex-wrap items-center gap-8 text-slate">

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

            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber/10 blur-3xl" />

            <div className="absolute -bottom-12 -left-10 h-40 w-40 rounded-full bg-teal/10 blur-3xl" />

            <h2 className="font-display text-2xl font-bold text-white">
              Today's Career Dashboard
            </h2>

            <p className="mt-2 text-slate">
              Track your AI-powered career progress.
            </p>

            {/* Dashboard Cards Start */}
                        <div className="mt-8 grid grid-cols-2 gap-5">

              {/* Resume Analysis */}

              <div className="group rounded-3xl bg-panel p-5 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">

                <div className="flex items-center justify-between">

                  <p className="text-sm font-medium text-slate">
                    Resume Analysis
                  </p>

                  <span className="rounded-full bg-teal-dim/20 px-2 py-1 text-[10px] font-bold text-teal">
                    LIVE
                  </span>

                </div>

                <h3 className="mt-3 text-4xl font-extrabold text-amber-dim">
                  92%
                </h3>

                <div className="mt-5 h-2 rounded-full bg-panel-2">
                  <div className="h-2 w-[92%] rounded-full bg-gradient-to-r from-teal to-teal-dim" />
                </div>

              </div>

              {/* Mock Interviews */}

              <div className="group rounded-3xl bg-panel p-5 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">

                <p className="text-sm font-medium text-slate">
                  Mock Interviews
                </p>

                <h3 className="mt-3 text-4xl font-extrabold text-amber-dim">
                  12
                </h3>

                <p className="mt-5 text-sm font-semibold text-teal">
                  ↗ +3 This Week
                </p>

              </div>

              {/* Career Score */}

              <div className="group rounded-3xl bg-panel p-5 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">

                <p className="text-sm font-medium text-slate">
                  Career Score
                </p>

                <h3 className="mt-3 text-2xl font-extrabold text-amber-dim">
                  Excellent
                </h3>

                <div className="mt-5 h-2 rounded-full bg-panel-2">
                  <div className="h-2 w-[88%] rounded-full bg-gradient-to-r from-amber to-yellow-400" />
                </div>

              </div>

              {/* AI Roadmap */}

              <div className="group rounded-3xl bg-panel p-5 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">

                <p className="text-sm font-medium text-slate">
                  AI Roadmap
                </p>

                <h3 className="mt-3 text-xl font-extrabold text-teal">
                  Ready
                </h3>

                <div className="mt-5 flex items-center gap-2">

                  <span className="h-3 w-3 animate-pulse rounded-full bg-teal" />

                  <span className="text-sm font-semibold text-teal">
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