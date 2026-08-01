"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function DashboardFeatures() {
  const router = useRouter();

  const features = [
    {
      title: "AI Career Chat",
      description:
        "Talk to RESEE AI about resumes, interviews, coding, salary, career growth, learning roadmaps and anything related to your career.",
      badge: "LIVE",
      button: "Open AI Chat",

      // ⚠️ Change this route if your chat page has a different URL
      action: () => router.push("/chat"),

      enabled: true,
    },

    {
      title: "Resume Analyzer",
      description:
        "Analyse your resume with AI, receive ATS scoring, identify weaknesses and generate professional improvements.",
      badge: "LIVE",
      button: "Analyse Resume",
      action: () => router.push("/resume"),
      enabled: true,
    },

    {
      title: "Documents",
      description:
        "Upload PDFs, notes and study material. Chat with AI, summarise content and organize everything in one place.",
      badge: "LIVE",
      button: "Open Documents",
      action: () => router.push("/documents"),
      enabled: true,
    },

    {
      title: "Mock Interview",
      description: "Step into a focused mock interview tailored to your role and experience level.",
      badge: "LIVE",
      button: "Start Interview",
      action: () => router.push("/interviews"),
      enabled: true,
    },

    {
      title: "Resume Builder",
      description:
        "Answer a few guided questions and ReSee automatically generates a professional, ATS-ready resume for you.",
      badge: "LIVE",
      button: "Build Resume",
      action: () => router.push("/resumes"),
      enabled: true,
    },

    {
      title: "Career Roadmap",
      description:
        "Generate personalized learning plans and step-by-step career roadmaps based on your goals.",
      badge: "Coming Soon",
      button: "Coming Soon",
      enabled: false,
    },

    {
      title: "Skill Gap Analysis",
      description:
        "Discover missing skills for your dream job and receive AI recommendations to improve faster.",
      badge: "Coming Soon",
      button: "Coming Soon",
      enabled: false,
    },
  ];

  return (
    <section className="mt-14">
      <h2 className="font-display mb-8 text-2xl font-extrabold text-bone">AI Career Workspace</h2>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature, index) => {
          const isPrimary = index === 0;

          return (
            <div
              key={feature.title}
              className={
                isPrimary
                  ? "rounded-3xl p-8 text-ink xl:col-span-2"
                  : "rounded-3xl border-2 border-bone bg-panel p-8"
              }
              style={
                isPrimary
                  ? {
                      background:
                        "linear-gradient(135deg, var(--color-amber), var(--color-amber-dim))",
                    }
                  : undefined
              }
            >
              {isPrimary && (
                <span className="inline-block rounded-full bg-bone px-3.5 py-1 text-[11px] font-bold text-ink">
                  FEATURED
                </span>
              )}

              <h3
                className={`font-display mt-5 text-xl font-extrabold ${isPrimary ? "text-ink" : "text-bone"}`}
              >
                {feature.title}
              </h3>

              <p className={`mt-3 text-sm leading-6 ${isPrimary ? "text-ink/85" : "text-bone/60"}`}>
                {feature.description}
              </p>

              <button
                onClick={feature.action}
                disabled={!feature.enabled}
                className={`mt-6 flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold transition-all ${
                  feature.enabled
                    ? isPrimary
                      ? "bg-ink text-bone hover:scale-[1.02]"
                      : "border-2 border-bone text-bone hover:bg-bone hover:text-ink"
                    : "cursor-not-allowed bg-panel-2 text-slate"
                }`}
              >
                {feature.button}
                {feature.enabled && <ArrowRight size={16} />}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
