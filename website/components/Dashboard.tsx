"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useProfile } from "@/hooks/useProfile";
import { useCareerScore } from "@/hooks/useCareerScore";
import { useContinueLearning } from "@/hooks/useContinueLearning";
import DashboardTodaysFocus from "@/components/DashboardTodaysFocus";
import DashboardHero from "@/components/DashboardHero";
import DashboardStats from "@/components/DashboardStats";
import DashboardGoalCard from "@/components/DashboardGoalCard";
import DashboardContinueLearning from "@/components/DashboardContinueLearning";
import DashboardAchievements from "@/components/DashboardAchievements";
import DashboardCareerScore from "@/components/DashboardCareerScore";
import DashboardFeatures from "@/components/DashboardFeatures";

export default function Dashboard() {
  const [resumeCount, setResumeCount] = useState(0);
  const [documentCount, setDocumentCount] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);

  const { data: profile, loading: profileLoading } = useProfile();
  const {
    data: careerScore,
    loading: careerScoreLoading,
    error: careerScoreError,
  } = useCareerScore();
  const { data: continueLearning, loading: continueLearningLoading } = useContinueLearning();

  async function loadStats() {
    try {
      const { count } = await supabase.from("resume_history").select("*", {
        count: "exact",
        head: true,
      });

      setResumeCount(count || 0);

      const { data: documentFiles, error } = await supabase.storage.from("uploads").list();

      if (error) {
        console.error(error);
      } else {
        setDocumentCount(documentFiles?.length || 0);
      }
    } finally {
      setStatsLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div id="dashboard" className="mx-auto max-w-7xl">
      <DashboardHero profile={profile} />

      {/* Today's Focus + Career Health Score side-by-side on desktop —
          these are "the core dashboard experience" (per the redesign
          brief), so they share a row and use the width intelligently
          instead of each stacking full-width one after another.
          items-start (not items-stretch, CSS Grid's default): Today's
          Focus is naturally much shorter than Career Health Score's
          gauge + 6 sub-metrics + history chart. Stretching both to the
          row's tallest item just padded Today's Focus with empty space
          below its content — items-start lets each card size to its
          own content height instead. */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_1.3fr]">
        <DashboardTodaysFocus
          profile={profile}
          profileLoading={profileLoading}
          careerScore={careerScore}
          careerScoreLoading={careerScoreLoading}
          resumeCount={resumeCount}
          statsLoading={statsLoading}
        />

        <DashboardCareerScore
          data={careerScore}
          loading={careerScoreLoading}
          error={careerScoreError}
        />
      </div>

      <DashboardStats resumeCount={resumeCount} documentCount={documentCount} />

      {/* Goals & Learning — one unified card instead of three
          standalone ones: Goal and Continue Learning are the primary/
          actionable zones, Achievements sits as the narrower,
          supporting third column. */}
      <section className="mt-8">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-bone/40">
          Goals &amp; Learning
        </p>

        <div className="grid grid-cols-1 divide-y divide-bone/10 overflow-hidden rounded-2xl border border-bone/10 bg-panel shadow-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="p-6">
            <DashboardGoalCard profile={profile} loading={profileLoading} />
          </div>

          <div className="p-6">
            <DashboardContinueLearning data={continueLearning} loading={continueLearningLoading} />
          </div>

          <div className="p-6">
            <DashboardAchievements
              profile={profile}
              careerScore={careerScore}
              resumeCount={resumeCount}
              loading={profileLoading || careerScoreLoading || statsLoading}
            />
          </div>
        </div>
      </section>

      <DashboardFeatures />

      <footer className="mt-18 border-t border-bone/15 pt-9 text-center">
        <h3 className="font-display text-lg font-extrabold text-bone">RESEE</h3>

        <p className="mt-3 text-sm text-bone/50">© 2026 RESEE. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
