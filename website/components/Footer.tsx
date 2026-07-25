"use client";

import { useRouter } from "next/navigation";

export default function Footer() {
  const router = useRouter();

  return (
    <footer
      id="about"
      className="bg-[#041E18] text-white"
    >
      <div className="mx-auto max-w-7xl px-6 py-20">

        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}

          <div>

            <h2 className="text-3xl font-extrabold text-[#D4AF37]">
              ✦ Mentora
            </h2>

            <p className="mt-5 leading-8 text-gray-300">
              Your AI Career Mentor helping students and professionals
              build stronger resumes, prepare for interviews and grow
              their careers with confidence.
            </p>

          </div>

          {/* Quick Links */}

          <div>

            <h3 className="text-xl font-bold">
              Quick Links
            </h3>

            <div className="mt-5 flex flex-col gap-3">

              <button
                onClick={() => router.push("/")}
                className="text-left text-gray-300 hover:text-[#D4AF37]"
              >
                Home
              </button>

              <button
                onClick={() => router.push("/login")}
                className="text-left text-gray-300 hover:text-[#D4AF37]"
              >
                Login
              </button>

              <button
                onClick={() => router.push("/signup")}
                className="text-left text-gray-300 hover:text-[#D4AF37]"
              >
                Sign Up
              </button>

            </div>

          </div>

          {/* Features */}

          <div>

            <h3 className="text-xl font-bold">
              Features
            </h3>

            <div className="mt-5 flex flex-col gap-3 text-gray-300">

              <span>📄 Resume Analyzer</span>

              <span>📝 Resume Builder</span>

              <span>🎤 Mock Interviews</span>

              <span>🧭 Career Roadmaps</span>

              <span>📈 Skill Gap Analysis</span>

            </div>

          </div>

          {/* Contact */}

          <div>

            <h3 className="text-xl font-bold">
              Contact
            </h3>

            <div className="mt-5 space-y-3 text-gray-300">

              <p>📧 support@mentora.ai</p>

              <p>🌐 www.mentora.ai</p>

              <p>🇮🇳 Built with ❤️ in India</p>

            </div>

          </div>

        </div>

        <div className="my-10 h-px bg-white/10"></div>

        <div className="flex flex-col items-center justify-between gap-5 md:flex-row">

          <p className="text-sm text-gray-400">
            © 2026 Mentora. All Rights Reserved.
          </p>

          <div className="flex gap-4">

            <button className="rounded-full bg-white/10 p-3 transition hover:bg-[#D4AF37] hover:text-[#041E18]">
              🌐
            </button>

            <button className="rounded-full bg-white/10 p-3 transition hover:bg-[#D4AF37] hover:text-[#041E18]">
              💼
            </button>

            <button className="rounded-full bg-white/10 p-3 transition hover:bg-[#D4AF37] hover:text-[#041E18]">
              🐦
            </button>

            <button className="rounded-full bg-white/10 p-3 transition hover:bg-[#D4AF37] hover:text-[#041E18]">
              📷
            </button>

          </div>

        </div>

      </div>

    </footer>
  );
}