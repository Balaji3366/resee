"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, PartyPopper } from "lucide-react";
import type { ProfileData } from "@/hooks/useProfile";
import type { CareerScoreData } from "@/hooks/useCareerScore";

interface DashboardTodaysMissionProps {
  profile: ProfileData | null;
  profileLoading: boolean;
  careerScore: CareerScoreData | null;
  careerScoreLoading: boolean;
  resumeCount: number;
  statsLoading: boolean;
}

export default function DashboardTodaysMission({
  profile,
  profileLoading,
  careerScore,
  careerScoreLoading,
  resumeCount,
  statsLoading,
}: DashboardTodaysMissionProps) {
  const loading = profileLoading || careerScoreLoading || statsLoading;

  if (loading) {
    return (
      <div className="mb-8 h-32 animate-pulse rounded-3xl border border-amber/20 bg-panel" />
    );
  }

  const items = [
    {
      key: "profile",
      label: "Complete your career profile",
      done: profile?.onboardingCompleted ?? false,
    },
    {
      key: "resume",
      label: "Analyze your resume",
      done: resumeCount > 0,
      cta: resumeCount === 0 ? { label: "Analyze resume", href: "/resume" } : undefined,
    },
    {
      key: "score",
      label: "Check your Career Health Score",
      done: careerScore?.overallStatus === "computed",
    },
  ];

  const allDone = items.every((item) => item.done);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8 rounded-3xl border border-amber/20 bg-panel p-7 shadow-md"
    >
      {allDone ? (
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber/10">
            <PartyPopper className="text-amber" size={24} />
          </div>

          <div>
            <h3 className="text-lg font-bold text-bone">
              You&apos;re all caught up for today
            </h3>

            <p className="mt-1 text-sm text-slate">
              Nice work — come back tomorrow for your next set of tasks.
            </p>
          </div>
        </div>
      ) : (
        <>
          <h3 className="text-lg font-bold text-bone">
            Today&apos;s Mission
          </h3>

          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={item.key} className="flex items-center gap-3">
                {item.done ? (
                  <CheckCircle2 className="shrink-0 text-amber" size={20} />
                ) : (
                  <Circle className="shrink-0 text-slate" size={20} />
                )}

                <span
                  className={`flex-1 ${
                    item.done ? "text-slate line-through" : "text-bone"
                  }`}
                >
                  {item.label}
                </span>

                {!item.done && item.cta && (
                  <Link
                    href={item.cta.href}
                    className="text-sm font-semibold text-amber hover:underline"
                  >
                    {item.cta.label} →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}
