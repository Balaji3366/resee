"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  FileText,
  FolderOpen,
  Mic,
  TrendingUp,
} from "lucide-react";

export default function DashboardFeatures() {
  const router = useRouter();

  const features = [
    {
      title: "Resume Analyzer",
      description:
        "Analyse your resume with AI, receive ATS scoring, identify weaknesses and generate professional improvements.",
      icon: FileText,
      badge: "LIVE",
      badgeColor: "bg-emerald-100 text-emerald-700",
      iconBg: "bg-[#EEF7F2]",
      iconColor: "text-[#0A3B2E]",
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
      badgeColor: "bg-emerald-100 text-emerald-700",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      button: "Open Documents",
      action: () => router.push("/documents"),
      enabled: true,
    },
    {
      title: "Mock Interview",
      description:
        "Practice HR and technical interviews with realistic AI conversations and detailed feedback reports.",
      icon: Mic,
      badge: "Coming Soon",
      badgeColor: "bg-yellow-100 text-yellow-700",
      iconBg: "bg-yellow-50",
      iconColor: "text-[#D4AF37]",
      button: "Coming Soon",
      enabled: false,
    },
    {
      title: "Resume Builder",
      description:
        "Build modern ATS-friendly resumes using premium templates with AI-powered writing assistance.",
      icon: FileText,
      badge: "Coming Soon",
      badgeColor: "bg-yellow-100 text-yellow-700",
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      button: "Coming Soon",
      enabled: false,
    },
    {
      title: "Career Roadmap",
      description:
        "Generate personalized learning plans and step-by-step career roadmaps based on your goals.",
      icon: TrendingUp,
      badge: "Coming Soon",
      badgeColor: "bg-yellow-100 text-yellow-700",
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
      button: "Coming Soon",
      enabled: false,
    },
    {
      title: "Skill Gap Analysis",
      description:
        "Discover missing skills for your dream job and receive AI recommendations to improve faster.",
      icon: BookOpen,
      badge: "Coming Soon",
      badgeColor: "bg-yellow-100 text-yellow-700",
      iconBg: "bg-pink-50",
      iconColor: "text-pink-600",
      button: "Coming Soon",
      enabled: false,
    },
  ];

  return (
    <section className="mt-16">

      <div className="mb-8">

        <h2 className="text-3xl font-bold text-[#06281F]">
          AI Career Workspace
        </h2>

        <p className="mt-2 text-gray-600">
          Everything you need to learn, prepare and get hired—all powered by AI.
        </p>

      </div>

      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">

        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <div
              key={feature.title}
              className="group rounded-3xl border border-[#D4AF37]/20 bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="flex items-start justify-between">

                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl ${feature.iconBg}`}
                >
                  <Icon
                    className={feature.iconColor}
                    size={30}
                  />
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${feature.badgeColor}`}
                >
                  {feature.badge}
                </span>

              </div>

              <h3 className="mt-6 text-2xl font-bold text-[#06281F]">
                {feature.title}
              </h3>

              <p className="mt-4 leading-7 text-gray-600">
                {feature.description}
              </p>

              <button
                onClick={feature.action}
                disabled={!feature.enabled}
                className={`mt-8 flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-semibold transition-all ${
                  feature.enabled
                    ? "bg-[#0A3B2E] text-white hover:bg-[#14532D] hover:scale-[1.02]"
                    : "cursor-not-allowed bg-gray-200 text-gray-500"
                }`}
              >
                {feature.button}

                {feature.enabled && (
                  <ArrowRight size={18} />
                )}
              </button>

            </div>
          );
        })}

      </div>

    </section>
  );
}