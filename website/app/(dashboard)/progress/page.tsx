"use client";

import OverallProgressSection from "@/components/progress/OverallProgressSection";
import WeeklyActivityChart from "@/components/progress/WeeklyActivityChart";
import MonthlyActivitySection from "@/components/progress/MonthlyActivitySection";
import SkillProgressList from "@/components/progress/SkillProgressList";
import StrengthsAndWeaknesses from "@/components/progress/StrengthsAndWeaknesses";
import LearningStreakSection from "@/components/progress/LearningStreakSection";
import AchievementBadgeGrid from "@/components/progress/AchievementBadgeGrid";
import MilestonesSection from "@/components/progress/MilestonesSection";
import PerformanceTimeline from "@/components/progress/PerformanceTimeline";
import ProgressEmptyState from "@/components/progress/ProgressEmptyState";
import { useProgressOverview } from "@/hooks/useProgressOverview";
import { useProgressActivity } from "@/hooks/useProgressActivity";
import { useSkillProgress } from "@/hooks/useSkillProgress";
import { useAchievements } from "@/hooks/useAchievements";
import { useMilestones } from "@/hooks/useMilestones";
import { useProgressTimeline } from "@/hooks/useProgressTimeline";

export default function ProgressPage() {
  const { data: overview, loading: overviewLoading } = useProgressOverview();
  const { data: activity, loading: activityLoading } = useProgressActivity();
  const { data: skillsData, loading: skillsLoading } = useSkillProgress();
  const { data: achievements, loading: achievementsLoading } = useAchievements();
  const { data: milestones, loading: milestonesLoading } = useMilestones();
  const { data: timeline, loading: timelineLoading } = useProgressTimeline();

  const loading = overviewLoading || activityLoading || skillsLoading;
  const hasActivity = overview?.hasAnyActivity ?? false;

  return (
    <div className="mx-auto max-w-6xl">
              <div className="mb-8">
                <h1 className="font-display text-3xl font-extrabold text-bone md:text-4xl">
                  Progress
                </h1>

                <p className="mt-2 text-slate">
                  Your personal career progress center — how far you&apos;ve come, and what&apos;s next.
                </p>
              </div>

              {loading && (
                <div className="space-y-6">
                  <div className="h-64 animate-pulse rounded-3xl border border-amber/20 bg-panel" />
                  <div className="h-56 animate-pulse rounded-3xl border border-amber/20 bg-panel" />
                </div>
              )}

              {!loading && !hasActivity && (
                <div className="space-y-8">
                  <ProgressEmptyState />

                  {!achievementsLoading && achievements && (
                    <AchievementBadgeGrid achievements={achievements} />
                  )}

                  {!milestonesLoading && milestones && (
                    <MilestonesSection milestones={milestones} />
                  )}
                </div>
              )}

              {!loading && hasActivity && overview && activity && skillsData && (
                <div className="space-y-8">
                  <OverallProgressSection overview={overview} />

                  <WeeklyActivityChart data={activity.weekly} />

                  <MonthlyActivitySection monthly={activity.monthly} />

                  <SkillProgressList skills={skillsData.skills} />

                  <StrengthsAndWeaknesses
                    strengths={skillsData.strengths}
                    areasToImprove={skillsData.areasToImprove}
                  />

                  <LearningStreakSection overview={overview} />

                  {!achievementsLoading && achievements && (
                    <AchievementBadgeGrid achievements={achievements} />
                  )}

                  {!milestonesLoading && milestones && (
                    <MilestonesSection milestones={milestones} />
                  )}

                  {!timelineLoading && timeline && <PerformanceTimeline entries={timeline} />}
                </div>
              )}
    </div>
  );
}
