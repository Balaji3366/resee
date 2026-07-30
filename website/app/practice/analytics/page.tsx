"use client";

import { useState } from "react";
import { Target, TrendingUp, Clock, ListChecks } from "lucide-react";
import DashboardNavbar from "@/components/DashboardNavbar";
import DashboardSidebar from "@/components/DashboardSidebar";
import PracticeStatTile from "@/components/practice/PracticeStatTile";
import PracticeTrendChart from "@/components/practice/PracticeTrendChart";
import PracticeTopicAccuracyChart from "@/components/practice/PracticeTopicAccuracyChart";
import PracticeEmptyState from "@/components/practice/PracticeEmptyState";
import { usePracticeAnalytics } from "@/hooks/usePracticeAnalytics";
import { usePracticeCatalog } from "@/hooks/usePracticeCatalog";

export default function PracticeAnalyticsPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const { data: analytics, loading } = usePracticeAnalytics();
  const { data: catalog } = usePracticeCatalog();

  return (
    <section className="min-h-screen bg-ink pt-2 pb-16">
      <div className="mx-auto max-w-[96rem] px-6">
        <div className="flex gap-6 lg:gap-8">
          <DashboardSidebar
            mobileOpen={mobileNavOpen}
            onMobileClose={() => setMobileNavOpen(false)}
          />

          <div className="min-w-0 flex-1">
            <div className="mx-auto max-w-6xl">
              <DashboardNavbar onMenuClick={() => setMobileNavOpen(true)} />

              <div className="mb-8">
                <h1 className="font-display text-3xl font-extrabold text-bone md:text-4xl">
                  Performance Analytics
                </h1>

                <p className="mt-2 text-slate">
                  Track your progress and see where to focus next.
                </p>
              </div>

              {loading && (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-32 animate-pulse rounded-3xl border border-amber/20 bg-panel"
                    />
                  ))}
                </div>
              )}

              {!loading && analytics && analytics.totalQuestionsSolved === 0 && (
                <PracticeEmptyState
                  categories={catalog?.categories ?? []}
                  message="Your analytics build up as you practice — nothing to show yet."
                />
              )}

              {!loading && analytics && analytics.totalQuestionsSolved > 0 && (
                <>
                  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                    <PracticeStatTile
                      label="Questions Solved"
                      value={String(analytics.totalQuestionsSolved)}
                      icon={ListChecks}
                    />
                    <PracticeStatTile
                      label="Accuracy"
                      value={`${analytics.accuracyPercent}%`}
                      icon={Target}
                    />
                    <PracticeStatTile
                      label="Average Score"
                      value={`${analytics.averageScore}%`}
                      icon={TrendingUp}
                    />
                    <PracticeStatTile
                      label="Total Practice Time"
                      value={`${analytics.totalPracticeMinutes} min`}
                      icon={Clock}
                    />
                  </div>

                  <div className="mt-8 grid gap-6 lg:grid-cols-2">
                    <PracticeTrendChart
                      title="Weekly Progress"
                      data={analytics.weekly}
                      gradientId="practiceWeeklyFill"
                    />
                    <PracticeTrendChart
                      title="Monthly Progress"
                      data={analytics.monthly}
                      gradientId="practiceMonthlyFill"
                    />
                  </div>

                  <div className="mt-8 grid gap-6 lg:grid-cols-2">
                    <PracticeTopicAccuracyChart
                      title="Weak Topics"
                      topics={analytics.weakTopics}
                      barColor="#f87171"
                      emptyMessage="No weak topics yet — keep practicing to see this fill in."
                    />
                    <PracticeTopicAccuracyChart
                      title="Strong Topics"
                      topics={analytics.strongTopics}
                      barColor="var(--color-teal)"
                      emptyMessage="No strong topics yet — keep practicing to see this fill in."
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
