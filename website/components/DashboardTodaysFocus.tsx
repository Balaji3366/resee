"use client";

import DashboardTodaysMission from "@/components/DashboardTodaysMission";
import DashboardDailyRecommendation from "@/components/DashboardDailyRecommendation";
import type { ProfileData } from "@/hooks/useProfile";
import type { CareerScoreData } from "@/hooks/useCareerScore";

interface DashboardTodaysFocusProps {
  profile: ProfileData | null;
  profileLoading: boolean;
  careerScore: CareerScoreData | null;
  careerScoreLoading: boolean;
  resumeCount: number;
  statsLoading: boolean;
}

/**
 * This is meant to be the dashboard's primary "what do I do right now"
 * area — previously it had the exact same neutral bg-panel/border
 * treatment as every other card, so nothing set it apart. A subtle warm
 * tint + accent border give it real visual weight without becoming a
 * loud gradient banner (the tint is a 6% wash, not a saturated fill).
 * Sits side-by-side with Career Health Score on desktop (see
 * Dashboard.tsx) — no longer owns a full-width section/margin, the
 * parent grid handles that.
 */
export default function DashboardTodaysFocus(props: DashboardTodaysFocusProps) {
  return (
    <section
      className="animate-fade-up rounded-2xl border border-amber/20 p-6 shadow-sm lg:p-7"
      style={{
        animationDelay: "0.05s",
        background: "linear-gradient(160deg, rgba(255,107,74,0.07), var(--color-panel) 55%)",
      }}
    >
      <div className="flex items-center gap-2.5">
        <span className="h-2 w-2 shrink-0 rounded-full bg-amber" />
        <h2 className="text-lg font-extrabold text-bone">Today&apos;s Focus</h2>
      </div>

      <div className="mt-5">
        <DashboardTodaysMission {...props} />
      </div>

      <div className="my-5 border-t border-bone/10" />

      <DashboardDailyRecommendation />
    </section>
  );
}
