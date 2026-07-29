"use client";

import { useRouter } from "next/navigation";

export default function Footer() {
  const router = useRouter();

  return (
    <footer
      id="about"
      className="relative overflow-hidden bg-panel-2 text-white"
    >

      {/* Background Glow */}

      <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-amber/10 blur-[120px]" />

      <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-teal/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-6 py-24">

        <div className="grid gap-14 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}

          <div>

            <div className="inline-flex items-center rounded-2xl bg-panel/5 px-5 py-3 backdrop-blur-md">

              <h2 className="font-display text-3xl font-extrabold text-amber">
                ✦ RESEE
              </h2>

            </div>

            <p className="mt-6 leading-8 text-slate">
              Your AI Career Mentor helping students and professionals
              build stronger resumes, prepare for interviews,
              improve skills and confidently land their dream careers.
            </p>

            <div className="mt-8 flex gap-4">

              <div className="rounded-xl border border-white/10 bg-panel/5 px-4 py-3 text-center backdrop-blur-md">

                <h3 className="text-2xl font-bold text-amber">
                  10K+
                </h3>

                <p className="mt-1 text-xs text-slate">
                  Users
                </p>

              </div>

              <div className="rounded-xl border border-white/10 bg-panel/5 px-4 py-3 text-center backdrop-blur-md">

                <h3 className="text-2xl font-bold text-amber">
                  ★4.9
                </h3>

                <p className="mt-1 text-xs text-slate">
                  Rating
                </p>

              </div>

            </div>

          </div>

          {/* Quick Links */}

          <div>

            <h3 className="text-xl font-bold text-white">
              Quick Links
            </h3>

            <div className="mt-6 flex flex-col gap-4">

              <button
                onClick={() => router.push("/")}
                className="text-left text-slate transition hover:translate-x-2 hover:text-amber"
              >
                Home
              </button>

              <button
                onClick={() => router.push("/login")}
                className="text-left text-slate transition hover:translate-x-2 hover:text-amber"
              >
                Login
              </button>

              <button
                onClick={() => router.push("/signup")}
                className="text-left text-slate transition hover:translate-x-2 hover:text-amber"
              >
                Sign Up
              </button>

            </div>

          </div>

          {/* Features */}

          <div>

            <h3 className="text-xl font-bold text-white">
              AI Features
            </h3>

            <div className="mt-6 flex flex-col gap-4 text-slate">

              <span>📄 Resume Analyzer</span>

              <span>📝 Resume Builder</span>

              <span>🎤 Mock Interviews</span>

              <span>🧭 Career Roadmaps</span>

              <span>📈 Skill Gap Analysis</span>

              <span>💼 Job Match</span>

            </div>

          </div>

          {/* Contact */}

          <div>

            <h3 className="text-xl font-bold text-white">
              Contact
            </h3>

            <div className="mt-6 space-y-4 text-slate">

              <p>📧 support@resee.ai</p>

              <p>🌍 www.resee.ai</p>

              <p>🇮🇳 Built with ❤️ in India</p>

              <p>⚡ Powered by AI</p>

            </div>

            <div className="mt-8 flex gap-3">
                            <button className="rounded-xl border border-white/10 bg-panel/5 p-3 transition-all duration-300 hover:scale-110 hover:bg-amber hover:text-ink">
                🌐
              </button>

              <button className="rounded-xl border border-white/10 bg-panel/5 p-3 transition-all duration-300 hover:scale-110 hover:bg-amber hover:text-ink">
                💼
              </button>

              <button className="rounded-xl border border-white/10 bg-panel/5 p-3 transition-all duration-300 hover:scale-110 hover:bg-amber hover:text-ink">
                🐦
              </button>

              <button className="rounded-xl border border-white/10 bg-panel/5 p-3 transition-all duration-300 hover:scale-110 hover:bg-amber hover:text-ink">
                📷
              </button>

            </div>

          </div>

        </div>

        <div className="my-14 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">

          <div>

            <p className="text-sm text-slate">
              © 2026 <span className="font-semibold text-amber">RESEE</span>. All Rights Reserved.
            </p>

            <p className="mt-2 text-xs text-slate">
              Built with ❤️ to help students and professionals grow their careers.
            </p>

          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-slate">

            <button className="transition hover:text-amber">
              Privacy Policy
            </button>

            <button className="transition hover:text-amber">
              Terms of Service
            </button>

            <button className="transition hover:text-amber">
              Contact
            </button>

          </div>

        </div>

      </div>

    </footer>
  );
}