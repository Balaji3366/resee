"use client";

import { useRouter } from "next/navigation";

export default function CTA() {
  const router = useRouter();

  return (
    <section className="bg-gradient-to-r from-[#06281F] via-[#0A3B2E] to-[#14532D] py-28">
      <div className="mx-auto max-w-5xl px-6 text-center">

        <span className="rounded-full bg-[#D4AF37]/20 px-5 py-2 text-sm font-semibold text-[#D4AF37]">
          START TODAY
        </span>

        <h2 className="mt-8 text-5xl font-extrabold leading-tight text-white">
          Ready to Build
          <br />
          Your Dream Career?
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-300">
          Join Mentora and let AI guide your journey—from building an
          ATS-friendly resume to preparing for interviews and achieving your
          dream job.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-5">

          <button
            onClick={() => router.push("/signup")}
            className="rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] px-8 py-4 font-semibold text-[#06281F] shadow-xl transition duration-300 hover:-translate-y-1 hover:scale-105"
          >
            Get Started Free →
          </button>

          <button
            onClick={() => router.push("/login")}
            className="rounded-xl border border-[#D4AF37] px-8 py-4 font-semibold text-[#D4AF37] transition hover:bg-[#D4AF37] hover:text-[#06281F]"
          >
            Login
          </button>

        </div>

      </div>
    </section>
  );
}