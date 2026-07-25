"use client";

import { useRouter } from "next/navigation";

export default function Footer() {
  const router = useRouter();

  return (
    <footer
      id="about"
      className="relative overflow-hidden bg-[#041E18] text-white"
    >

      {/* Background Glow */}

      <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-[#D4AF37]/10 blur-[120px]" />

      <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-emerald-500/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-6 py-24">

        <div className="grid gap-14 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}

          <div>

            <div className="inline-flex items-center rounded-2xl bg-white/5 px-5 py-3 backdrop-blur-md">

              <h2 className="text-3xl font-extrabold text-[#D4AF37]">
                ✦ Mentora
              </h2>

            </div>

            <p className="mt-6 leading-8 text-gray-300">
              Your AI Career Mentor helping students and professionals
              build stronger resumes, prepare for interviews,
              improve skills and confidently land their dream careers.
            </p>

            <div className="mt-8 flex gap-4">

              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center backdrop-blur-md">

                <h3 className="text-2xl font-bold text-[#D4AF37]">
                  10K+
                </h3>

                <p className="mt-1 text-xs text-gray-400">
                  Users
                </p>

              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center backdrop-blur-md">

                <h3 className="text-2xl font-bold text-[#D4AF37]">
                  ★4.9
                </h3>

                <p className="mt-1 text-xs text-gray-400">
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
                className="text-left text-gray-300 transition hover:translate-x-2 hover:text-[#D4AF37]"
              >
                Home
              </button>

              <button
                onClick={() => router.push("/login")}
                className="text-left text-gray-300 transition hover:translate-x-2 hover:text-[#D4AF37]"
              >
                Login
              </button>

              <button
                onClick={() => router.push("/signup")}
                className="text-left text-gray-300 transition hover:translate-x-2 hover:text-[#D4AF37]"
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

            <div className="mt-6 flex flex-col gap-4 text-gray-300">

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

            <div className="mt-6 space-y-4 text-gray-300">

              <p>📧 support@mentora.ai</p>

              <p>🌍 www.mentora.ai</p>

              <p>🇮🇳 Built with ❤️ in India</p>

              <p>⚡ Powered by AI</p>

            </div>

            <div className="mt-8 flex gap-3">
                            <button className="rounded-xl border border-white/10 bg-white/5 p-3 transition-all duration-300 hover:scale-110 hover:bg-[#D4AF37] hover:text-[#041E18]">
                🌐
              </button>

              <button className="rounded-xl border border-white/10 bg-white/5 p-3 transition-all duration-300 hover:scale-110 hover:bg-[#D4AF37] hover:text-[#041E18]">
                💼
              </button>

              <button className="rounded-xl border border-white/10 bg-white/5 p-3 transition-all duration-300 hover:scale-110 hover:bg-[#D4AF37] hover:text-[#041E18]">
                🐦
              </button>

              <button className="rounded-xl border border-white/10 bg-white/5 p-3 transition-all duration-300 hover:scale-110 hover:bg-[#D4AF37] hover:text-[#041E18]">
                📷
              </button>

            </div>

          </div>

        </div>

        <div className="my-14 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">

          <div>

            <p className="text-sm text-gray-400">
              © 2026 <span className="font-semibold text-[#D4AF37]">Mentora</span>. All Rights Reserved.
            </p>

            <p className="mt-2 text-xs text-gray-500">
              Built with ❤️ to help students and professionals grow their careers.
            </p>

          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">

            <button className="transition hover:text-[#D4AF37]">
              Privacy Policy
            </button>

            <button className="transition hover:text-[#D4AF37]">
              Terms of Service
            </button>

            <button className="transition hover:text-[#D4AF37]">
              Contact
            </button>

          </div>

        </div>

      </div>

    </footer>
  );
}