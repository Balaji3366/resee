"use client";

import Link from "next/link";
import { PartyPopper } from "lucide-react";
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
    return <div className="h-24 animate-pulse rounded-2xl bg-panel-2" />;
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
  const doneCount = items.filter((item) => item.done).length;

  return (
    <div>
      {allDone ? (
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber/10">
            <PartyPopper className="text-amber" size={24} />
          </div>

          <div>
            <h3 className="text-[15px] font-bold text-bone">You&apos;re all caught up for today</h3>

            <p className="mt-1 text-sm text-bone/60">
              Nice work — come back tomorrow for your next set of tasks.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-bone/50">Today&apos;s Mission</p>
            <p className="text-sm font-bold text-amber-dim">
              {doneCount}/{items.length} complete
            </p>
          </div>

          <div className="mt-2.5 h-1.5 w-full rounded-full bg-panel-2">
            <div
              className="h-1.5 rounded-full bg-amber-dim transition-all duration-700"
              style={{ width: `${(doneCount / items.length) * 100}%` }}
            />
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {items.map((item) => (
              <div key={item.key} className="flex items-center gap-3">
                <span className={`text-lg ${item.done ? "text-amber-dim" : "text-bone/25"}`}>
                  {item.done ? "●" : "○"}
                </span>

                <span
                  className={`flex-1 ${
                    item.done ? "text-bone/40 line-through" : "font-semibold text-bone"
                  }`}
                >
                  {item.label}
                </span>

                {!item.done && item.cta && (
                  <Link
                    href={item.cta.href}
                    className="text-sm font-bold text-amber hover:underline"
                  >
                    {item.cta.label} →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
