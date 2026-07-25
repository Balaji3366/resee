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

      <div className="mx-auto flex max-w-7xl flex-col items-center gap-16 px-6 lg:flex-row lg:px-10">

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

            Analyse resumes, prepare interviews, build personalized
            roadmaps, improve skills and land your dream job.

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

          {/* Trust */}

          <div className="mt-12 flex flex-wrap items-center gap-8 text-gray-300">

            <div>
              ⭐⭐⭐⭐⭐
            </div>

            <div>
              Trusted by <b className="text-white">10,000+</b> learners
            </div>

          </div>

        </div>

        {/* RIGHT */}

        <div className="flex-1">

          <div className="rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur-xl shadow-2xl">

            <h2 className="text-2xl font-bold text-white">
              Welcome to Mentora
            </h2>

            <p className="mt-2 text-gray-300">
              Let's build your dream career.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-5">

              <div className="rounded-2xl bg-white p-5 shadow-lg">
                <p className="text-sm text-gray-500">
                  ATS Score
                </p>

                <h3 className="mt-2 text-4xl font-bold text-[#14532D]">
                  92%
                </h3>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-lg">
                <p className="text-sm text-gray-500">
                  Interviews
                </p>

                <h3 className="mt-2 text-4xl font-bold text-[#14532D]">
                  12
                </h3>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-lg">
                <p className="text-sm text-gray-500">
                  Resume Score
                </p>

                <h3 className="mt-2 text-4xl font-bold text-[#14532D]">
                  Excellent
                </h3>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-lg">
                <p className="text-sm text-gray-500">
                  Roadmap
                </p>

                <h3 className="mt-2 text-lg font-bold text-[#14532D]">
                  Ready
                </h3>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}