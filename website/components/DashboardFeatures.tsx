"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Bot,
  FileText,
  FolderOpen,
  Mic,
  TrendingUp,
} from "lucide-react";

export default function DashboardFeatures() {
  const router = useRouter();

  const features = [
    {
      title: "AI Career Chat",
      description:
        "Talk to RESEE AI about resumes, interviews, coding, salary, career growth, learning roadmaps and anything related to your career.",
      icon: Bot,
      badge: "LIVE",
      badgeColor: "bg-teal-dim/20 text-teal",
      iconBg: "bg-panel",
      iconColor: "text-amber",
      button: "Open AI Chat",

      // ⚠️ Change this route if your chat page has a different URL
      action: () => router.push("/chat"),

      enabled: true,
    },

    {
      title: "Resume Analyzer",
      description:
        "Analyse your resume with AI, receive ATS scoring, identify weaknesses and generate professional improvements.",
      icon: FileText,
      badge: "LIVE",
      badgeColor: "bg-teal-dim/20 text-teal",
      iconBg: "bg-panel",
      iconColor: "text-amber",
      button: "Analyse Resume",
      action: () => router.push("/resume"),
      enabled: true,
    },

    {
      title: "Documents",
      description:
        "Upload PDFs, notes and study material. Chat with AI, summarise content and organize everything in one place.",
      icon: FolderOpen,
      badge: "LIVE",
      badgeColor: "bg-teal-dim/20 text-teal",
      iconBg: "bg-panel-2",
      iconColor: "text-teal",
      button: "Open Documents",
      action: () => router.push("/documents"),
      enabled: true,
    },

    {
      title: "Mock Interview",
      description:
        "Practice structured mock interviews across HR, Technical, Behavioural, and Scenario-Based formats, and track your progress.",
      icon: Mic,
      badge: "LIVE",
      badgeColor: "bg-teal-dim/20 text-teal",
      iconBg: "bg-panel",
      iconColor: "text-amber",
      button: "Start Interview",
      action: () => router.push("/interviews"),
      enabled: true,
    },

    {
      title: "Resume Builder",
      description:
        "Build, organize and export multiple resumes across professional templates, with autosave and version history.",
      icon: FileText,
      badge: "LIVE",
      badgeColor: "bg-teal-dim/20 text-teal",
      iconBg: "bg-panel",
      iconColor: "text-amber",
      button: "Build Resume",
      action: () => router.push("/resumes"),
      enabled: true,
    },

    {
      title: "Career Roadmap",
      description:
        "Generate personalized learning plans and step-by-step career roadmaps based on your goals.",
      icon: TrendingUp,
      badge: "Coming Soon",
      badgeColor: "bg-panel-2 text-slate",
      iconBg: "bg-panel-2",
      iconColor: "text-amber",
      button: "Coming Soon",
      enabled: false,
    },

    {
      title: "Skill Gap Analysis",
      description:
        "Discover missing skills for your dream job and receive AI recommendations to improve faster.",
      icon: BookOpen,
      badge: "Coming Soon",
      badgeColor: "bg-panel-2 text-slate",
      iconBg: "bg-panel-2",
      iconColor: "text-teal",
      button: "Coming Soon",
      enabled: false,
    },
  ];
    return (
    <section className="mt-16">
      <div className="mb-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-1 rounded-full bg-amber" />

          <div>
            <h2 className="font-display text-3xl font-bold text-bone">
              AI Career Workspace
            </h2>

            <p className="mt-2 text-slate">
              Everything you need to learn, prepare and get hired — powered by
              RESEE AI.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = feature.icon;

          const isPrimary = index === 0;

          return (
            <div
              key={feature.title}
              className={`group relative overflow-hidden rounded-3xl border p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                isPrimary
                  ? "border-amber bg-gradient-to-br from-amber to-amber-dim text-white xl:col-span-2"
                  : "border-amber/20 bg-panel"
              }`}
            >
              {isPrimary && (
                <div className="absolute right-0 top-0 rounded-bl-3xl bg-amber px-5 py-2 text-sm font-bold text-bone">
                  ⭐ Featured
                </div>
              )}

              <div className="flex items-start justify-between">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
                    isPrimary ? "bg-panel/15" : feature.iconBg
                  }`}
                >
                  <Icon
                    size={30}
                    className={
                      isPrimary ? "text-white" : feature.iconColor
                    }
                  />
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    isPrimary
                      ? "bg-panel text-amber"
                      : feature.badgeColor
                  }`}
                >
                  {feature.badge}
                </span>
              </div>

              <h3
                className={`mt-6 text-2xl font-bold ${
                  isPrimary ? "text-white" : "text-bone"
                }`}
              >
                {feature.title}
              </h3>

              <p
                className={`mt-4 leading-7 ${
                  isPrimary ? "text-white/90" : "text-slate"
                }`}
              >
                {feature.description}
              </p>

              <button
                onClick={feature.action}
                disabled={!feature.enabled}
                className={`mt-8 flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-semibold transition-all ${
                  feature.enabled
                    ? isPrimary
                      ? "bg-panel text-amber hover:scale-[1.02]"
                      : "bg-amber text-white hover:bg-amber-dim hover:scale-[1.02]"
                    : "cursor-not-allowed bg-panel-2 text-slate"
                }`}
              >
                {feature.button}

                {feature.enabled && <ArrowRight size={18} />}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}