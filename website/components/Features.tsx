"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ROLE_TYPES } from "@/constants/onboarding";
import type { RoleType } from "@/types/onboarding";

const features = [
  {
    icon: "📊",
    title: "Smart Assessment & Career Readiness Score",
    desc: {
      student: "Get an instant ATS score and a Career Readiness Score that shows exactly where you stand before you apply.",
      professional: "Benchmark your resume and get a Career Readiness Score tailored to your next move.",
    },
    link: "/resume",
    available: true,
    color: "from-emerald-500 to-green-600",
  },
  {
    icon: "🎙️",
    title: "Adaptive AI Voice Interview Simulator",
    desc: {
      student: "Practice real voice interviews with an AI interviewer that adapts to your answers.",
      professional: "Rehearse leadership and technical interviews with an AI voice simulator that adapts in real time.",
    },
    link: "#",
    available: false,
    color: "from-sky-500 to-blue-600",
  },
  {
    icon: "🧠",
    title: "Career Brain Memory System",
    desc: {
      student: "Your Career Health Score is tracked over time on a timeline graph, so you can see your progress as you grow.",
      professional: "See your career growth plotted over time, from your first resume upload to your next milestone.",
    },
    link: "/dashboard",
    available: true,
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: "🚀",
    title: "Day-1 Companion & Switch Radar",
    desc: {
      student: "Get guided support for your first 30 days on the job, plus alerts on future switch opportunities.",
      professional: "Get onboarding guidance for your first 30 days, plus a radar for your next career switch.",
    },
    link: "#",
    available: false,
    color: "from-orange-500 to-amber-600",
  },
];

const introCopy: Record<RoleType, string> = {
  student: "RESEE helps you enter the job market with confidence — analyse your resume, prepare for interviews, and close skill gaps before you graduate.",
  professional: "RESEE combines powerful AI tools to sharpen your resume, prepare for interviews, and accelerate your next career move.",
};

const PERSONA_TRACK_LABELS: Record<RoleType, string> = {
  student: "Student Track 🎓",
  professional: "Experienced Pro Track 💼",
};

export default function Features() {
  const router = useRouter();
  const [persona, setPersona] = useState<RoleType>("student");

  const handleClick = (feature: (typeof features)[0]) => {
    if (feature.available) {
      router.push(feature.link);
    } else {
      alert("🚧 Coming Soon");
    }
  };

  return (
    <section
      id="features"
      className="relative overflow-hidden bg-ink py-28"
    >
      {/* Background */}

      <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-amber/10 blur-[120px]" />

      <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-teal/10 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto max-w-7xl px-6"
      >

        {/* Heading */}

        <div className="text-center">

          <span className="inline-flex rounded-full border border-amber/30 bg-amber/10 px-6 py-2 text-sm font-bold uppercase tracking-wider text-amber">
            ⚙️ Core OS Feature Grid
          </span>

          <h2 className="font-display mt-8 text-5xl font-extrabold leading-tight text-bone md:text-6xl">
            Everything You Need
            <br />
            To Build Your Career
          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-slate">
            {introCopy[persona]}
          </p>

          <div className="mt-8 inline-flex items-center rounded-full border border-amber/20 bg-panel p-1">
            {ROLE_TYPES.map((role) => (
              <button
                key={role.value}
                onClick={() => setPersona(role.value)}
                className={`rounded-full px-6 py-2 text-sm font-semibold transition ${
                  persona === role.value
                    ? "bg-amber text-bone"
                    : "text-slate hover:text-bone"
                }`}
              >
                {PERSONA_TRACK_LABELS[role.value]}
              </button>
            ))}
          </div>

        </div>

        {/* Cards */}

        <div className="mt-20 grid gap-8 md:grid-cols-2">

          {features.map((feature) => (

            <div
                key={feature.title}
                className="group relative flex h-full flex-col overflow-hidden rounded-[30px] border border-amber/20 bg-panel p-8 shadow-lg transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_25px_60px_rgba(0,0,0,0.12)]"
              >

              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-amber/10 blur-3xl opacity-0 transition duration-500 group-hover:opacity-100" />

              <div
                className={`inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br ${feature.color} text-4xl shadow-xl transition duration-300 group-hover:scale-110 group-hover:rotate-6`}
              >
                {feature.icon}
              </div>

              <div className="mt-8 flex items-center justify-between">

                <h3 className="text-2xl font-bold text-bone">
                  {feature.title}
                </h3>

                {feature.available ? (
                  <span className="rounded-full bg-teal-dim/20 px-3 py-1 text-xs font-bold text-teal">
                    LIVE
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-dim/20 px-3 py-1 text-xs font-bold text-amber">
                    SOON
                  </span>
                )}

              </div>

              <p className="mt-5 min-h-[110px] leading-8 text-slate">

                {feature.desc[persona]}
              </p>

              <div className="mt-8 h-2 overflow-hidden rounded-full bg-panel-2">

                <div
                  className={`h-full rounded-full bg-gradient-to-r ${feature.color}`}
                  style={{
                    width: feature.available ? "100%" : "65%",
                  }}
                />

              </div>
                            <div className="mt-auto pt-8">

                <button
                  onClick={() => handleClick(feature)}
                  className={`group/button inline-flex w-full items-center justify-center rounded-2xl px-6 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.03] ${
                    feature.available
                      ? "bg-amber hover:bg-amber-dim"
                      : "bg-gray-400 hover:bg-slate"
                  }`}
                >
                  <span>
                    {feature.available ? "Open Feature" : "Coming Soon"}
                  </span>

                  <span className="ml-2 transition-transform duration-300 group-hover/button:translate-x-1">
                    →
                  </span>

                </button>

              </div>

              <div className="mt-8 flex items-center justify-between border-t border-bone/15 pt-6">

                <span className="text-sm font-medium text-slate">
                  AI Powered
                </span>

                <div className="flex items-center gap-2">

                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      feature.available
                        ? "animate-pulse bg-teal"
                        : "bg-amber-400"
                    }`}
                  />

                  <span
                    className={`text-sm font-semibold ${
                      feature.available
                        ? "text-teal"
                        : "text-amber-600"
                    }`}
                  >
                    {feature.available ? "Available" : "In Progress"}
                  </span>

                </div>

              </div>

            </div>

          ))}

        </div>

      </motion.div>

    </section>
  );
}