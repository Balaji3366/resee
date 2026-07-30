"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useProfile } from "@/hooks/useProfile";
import { useCareerScore } from "@/hooks/useCareerScore";
import { useContinueLearning } from "@/hooks/useContinueLearning";
import DashboardNavbar from "@/components/DashboardNavbar";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardGreeting from "@/components/DashboardGreeting";
import DashboardTodaysMission from "@/components/DashboardTodaysMission";
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const { data: profile, loading: profileLoading } = useProfile();
  const { data: careerScore, loading: careerScoreLoading, error: careerScoreError } =
    useCareerScore();
  const { data: continueLearning, loading: continueLearningLoading } =
    useContinueLearning();

  async function loadStats() {
    try {
      const { count } = await supabase
        .from("resume_history")
        .select("*", {
          count: "exact",
          head: true,
        });

      setResumeCount(count || 0);

      const { data: documentFiles, error } =
        await supabase.storage.from("uploads").list();

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
    <section
      id="dashboard"
      className="min-h-screen bg-ink pt-2 pb-16"
    >
      <div className="mx-auto max-w-[96rem] px-6">
        <div className="flex gap-6 lg:gap-8">
          <DashboardSidebar
            mobileOpen={mobileNavOpen}
            onMobileClose={() => setMobileNavOpen(false)}
          />

          <div className="min-w-0 flex-1">
            <div className="mx-auto max-w-7xl">

              <DashboardNavbar onMenuClick={() => setMobileNavOpen(true)} />

              <DashboardGreeting profile={profile} />

              <DashboardTodaysMission
                profile={profile}
                profileLoading={profileLoading}
                careerScore={careerScore}
                careerScoreLoading={careerScoreLoading}
                resumeCount={resumeCount}
                statsLoading={statsLoading}
              />

              <DashboardHero
                resumeCount={resumeCount}
                documentCount={documentCount}
              />

              <DashboardStats
                resumeCount={resumeCount}
                documentCount={documentCount}
              />

              <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                <DashboardGoalCard profile={profile} loading={profileLoading} />
                <DashboardContinueLearning
                  data={continueLearning}
                  loading={continueLearningLoading}
                />
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

              <footer className="mt-20 border-t border-amber/20 pt-10 text-center">
                <h3 className="text-2xl font-bold text-bone">
                  ✨ RESEE
                </h3>

                <p className="mt-3 max-w-2xl mx-auto text-slate leading-7">
                  Your AI Career Mentor. Helping students and professionals
                  analyse resumes, prepare for interviews and build successful
                  careers using Artificial Intelligence.
                </p>

                <div className="mt-8 flex justify-center gap-3">
                  <span className="rounded-full bg-teal-dim/20 px-4 py-2 text-sm font-semibold text-teal">
                    Resume AI
                  </span>

                  <span className="rounded-full bg-amber-dim/20 px-4 py-2 text-sm font-semibold text-amber">
                    Career Growth
                  </span>

                  <span className="rounded-full bg-panel-2 px-4 py-2 text-sm font-semibold text-slate">
                    Documents
                  </span>
                </div>

                <p className="mt-8 text-sm text-slate">
                  © 2026 RESEE. All Rights Reserved.
                </p>
              </footer>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
