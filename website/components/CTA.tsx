"use client";

import { useRouter } from "next/navigation";

export default function CTA() {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#06281F] via-[#0A3B2E] to-[#14532D] py-28">

      {/* Background Glow */}

      <div className="absolute -left-20 top-10 h-80 w-80 rounded-full bg-[#D4AF37]/20 blur-[120px]" />

      <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-emerald-500/20 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-6">

        <div className="overflow-hidden rounded-[36px] border border-white/10 bg-white/5 p-12 backdrop-blur-xl shadow-[0_25px_80px_rgba(0,0,0,0.35)]">

          <div className="text-center">

            <span className="inline-flex rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-6 py-2 text-sm font-bold uppercase tracking-wider text-[#F5E7A1]">
              🚀 Start Today
            </span>

            <h2 className="mt-8 text-5xl font-extrabold leading-tight text-white md:text-6xl">
              Ready To Build
              <br />
              Your Dream Career?
            </h2>

            <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-gray-300">
              Join Mentora and let AI guide every step of your career journey—
              from creating an ATS-friendly resume to mastering interviews and
              landing your dream job.
            </p>

            <div className="mt-12 flex flex-wrap justify-center gap-5">

              <button
                onClick={() => router.push("/signup")}
                className="rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] px-10 py-4 font-semibold text-[#06281F] shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105"
              >
                Get Started Free →
              </button>

              <button
                onClick={() => router.push("/login")}
                className="rounded-2xl border border-[#D4AF37] px-10 py-4 font-semibold text-[#D4AF37] transition-all duration-300 hover:bg-[#D4AF37] hover:text-[#06281F]"
              >
                Login
              </button>

            </div>

            {/* Trust Stats */}

            <div className="mt-16 grid gap-8 md:grid-cols-3">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">

                <h3 className="text-4xl font-extrabold text-[#D4AF37]">
                  10K+
                </h3>

                <p className="mt-2 text-gray-300">
                  Active Career Aspirants
                </p>

              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">

                <h3 className="text-4xl font-extrabold text-[#D4AF37]">
                  ★ 4.9
                </h3>

                <p className="mt-2 text-gray-300">
                  Average User Rating
                </p>

              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">

                <h3 className="text-4xl font-extrabold text-[#D4AF37]">
                  95%
                </h3>

                <p className="mt-2 text-gray-300">
                  ATS Score Improvement
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}