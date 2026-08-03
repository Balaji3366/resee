"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useProfile } from "@/hooks/useProfile";
import { useCareerScore } from "@/hooks/useCareerScore";
import { useContinueLearning } from "@/hooks/useContinueLearning";
import DashboardGreeting from "@/components/DashboardGreeting";
import DashboardTodaysMission from "@/components/DashboardTodaysMission";
import DashboardDailyRecommendation from "@/components/DashboardDailyRecommendation";
import DashboardHero from "@/components/DashboardHero";
import DashboardStats from "@/components/DashboardStats";
import DashboardGoalCard from "@/components/DashboardGoalCard";
import DashboardContinueLearning from "@/components/DashboardContinueLearning";
import DashboardLearningProgress from "@/components/DashboardLearningProgress";
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
      <DashboardGreeting profile={profile} />

      <DashboardTodaysMission
        profile={profile}
        profileLoading={profileLoading}
        careerScore={careerScore}
        careerScoreLoading={careerScoreLoading}
        resumeCount={resumeCount}
        statsLoading={statsLoading}
      />

      <DashboardDailyRecommendation />

      <DashboardHero resumeCount={resumeCount} documentCount={documentCount} />

      <DashboardStats resumeCount={resumeCount} documentCount={documentCount} />

      <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardGoalCard profile={profile} loading={profileLoading} />
        <DashboardContinueLearning data={continueLearning} loading={continueLearningLoading} />
        <DashboardLearningProgress
          subMetric={careerScore?.subMetrics.learningProgress}
          loading={careerScoreLoading}
        />
        <DashboardAchievements
          profile={profile}
          careerScore={careerScore}
          resumeCount={resumeCount}
          loading={profileLoading || careerScoreLoading || statsLoading}
        />
      </div>

      <DashboardCareerScore
        data={careerScore}
        loading={careerScoreLoading}
        error={careerScoreError}
      />

      <DashboardFeatures />

      <footer className="mt-18 border-t-2 border-bone pt-9 text-center">
        <h3 className="font-display text-lg font-extrabold text-bone">RESEE</h3>

        <p className="mt-3 text-sm text-bone/50">© 2026 RESEE. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
