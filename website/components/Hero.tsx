"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";

const floatingCards = [
  { label: "Learning Progress", value: "68%", className: "left-0 top-6" },
  { label: "Resume Score", value: "82", className: "right-0 top-1/2 -translate-y-1/2" },
  { label: "Mock Interview Score", value: "90%", className: "left-6 bottom-2" },
];

export default function Hero() {
  const router = useRouter();

  async function handleLaunchWorkspace() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      router.push("/dashboard");
    } else {
      router.push("/signup");
    }
  }

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden bg-ink pt-24"
    >
      {/* Soft sky-blue glow */}

      <div className="pointer-events-none absolute right-0 top-1/4 h-[32rem] w-[32rem] rounded-full bg-amber/10 blur-[140px]" />

      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-16 px-6 lg:flex-row lg:px-12">

        {/* LEFT */}

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex-1 text-center lg:text-left"
        >

          <h1 className="font-display text-5xl font-extrabold leading-tight text-bone md:text-6xl">
            Stop Searching.
            <br />
            Start Building
            <br />
            <span className="text-amber">Your Career.</span>
          </h1>

          <p className="mx-auto mt-8 max-w-lg text-lg leading-8 text-slate lg:mx-0">
            One platform to learn, practice, prepare for interviews, and get hired.
          </p>

          <div className="mt-10 flex justify-center lg:justify-start">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLaunchWorkspace}
              className="rounded-xl bg-amber px-9 py-4 font-semibold text-white shadow-lg shadow-amber/20 transition hover:shadow-xl hover:shadow-amber/30"
            >
              Get Started Free
            </motion.button>
          </div>

          <p className="mt-6 text-sm text-slate">
            Trusted by learners worldwide.
          </p>

        </motion.div>

        {/* RIGHT — illustration */}

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative flex flex-1 items-center justify-center lg:max-w-[38%]"
        >

          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >

            {/* Abstract "person at laptop" illustration */}

            <svg
              width="280"
              height="260"
              viewBox="0 0 280 260"
              className="drop-shadow-[0_20px_50px_rgba(47,143,239,0.15)]"
            >
              <ellipse cx="140" cy="230" rx="110" ry="16" fill="var(--color-amber)" opacity="0.08" />

              {/* seat / desk */}
              <rect x="60" y="150" width="160" height="70" rx="16" fill="var(--color-panel)" />

              {/* laptop */}
              <rect x="95" y="128" width="90" height="58" rx="8" fill="var(--color-amber-dim)" />
              <rect x="103" y="136" width="74" height="42" rx="4" fill="var(--color-ink)" />
              <rect x="90" y="182" width="100" height="8" rx="4" fill="var(--color-amber-dim)" />

              {/* person */}
              <circle cx="140" cy="80" r="30" fill="var(--color-amber)" />
              <path
                d="M92 150c0-30 22-48 48-48s48 18 48 48"
                fill="var(--color-amber)"
              />
            </svg>

          </motion.div>

          {floatingCards.map((card, i) => (
            <motion.div
              key={card.label}
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.6,
              }}
              className={`absolute rounded-2xl border border-amber/15 bg-panel px-4 py-3 shadow-md ${card.className}`}
            >
              <p className="text-xs font-medium text-slate">{card.label}</p>
              <p className="text-lg font-bold text-bone">{card.value}</p>
            </motion.div>
          ))}

        </motion.div>

      </div>

      {/* Scroll indicator */}

      <motion.button
        onClick={() =>
          document.getElementById("goals")?.scrollIntoView({ behavior: "smooth" })
        }
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate transition hover:text-amber"
        aria-label="Scroll down"
      >
        <ChevronDown size={28} />
      </motion.button>

    </section>
  );
}
