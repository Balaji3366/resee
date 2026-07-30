"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Plus, CheckCircle2, Clock, Flame, Layers, Users } from "lucide-react";
import ContinueInterviewPanel from "@/components/interviews/ContinueInterviewPanel";
import InterviewSetCard from "@/components/interviews/InterviewSetCard";
import InterviewEmptyState from "@/components/interviews/InterviewEmptyState";
import PracticeStatTile from "@/components/practice/PracticeStatTile";
import { useContinueInterviews } from "@/hooks/useContinueInterviews";
import { useInterviewSets } from "@/hooks/useInterviewSets";
import { useInterviewPerformance } from "@/hooks/useInterviewPerformance";

function formatMinutes(totalSeconds: number) {
  return `${Math.round(totalSeconds / 60)} min`;
}

export default function InterviewsDashboardPage() {
  const { data: continueItems, loading: continueLoading } = useContinueInterviews();
  const { data: sets, loading: setsLoading } = useInterviewSets();
  const { data: performance, loading: performanceLoading } = useInterviewPerformance();

  const recommended = useMemo(() => {
    return (sets ?? [])
      .filter((s) => s.isAvailable)
      .sort((a, b) => a.completedCount - b.completedCount)
      .slice(0, 4);
  }, [sets]);

  const neverAttempted =
    !continueLoading &&
    !performanceLoading &&
    (continueItems?.length ?? 0) === 0 &&
    (performance?.interviewsCompleted ?? 0) === 0;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-bone md:text-4xl">
            Mock Interviews
          </h1>
          <p className="mt-2 text-slate">
            Practice structured interviews across HR, Technical, Behavioural, and Scenario-Based
            formats.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/interviews/history"
            className="rounded-xl border border-bone/15 bg-panel px-4 py-2.5 font-semibold text-bone hover:bg-ink"
          >
            History
          </Link>
          <Link
            href="/interviews/setup"
            className="flex items-center gap-2 rounded-xl bg-amber px-4 py-2.5 font-semibold text-white transition hover:bg-amber-dim"
          >
            <Plus size={18} /> Start New Interview
          </Link>
        </div>
      </div>

      <ContinueInterviewPanel items={continueItems} loading={continueLoading} />

      {neverAttempted && (
        <div className="mb-10">
          <InterviewEmptyState />
        </div>
      )}

      <h2 className="mb-4 text-lg font-semibold text-slate">Interview Performance</h2>

      {performanceLoading ? (
        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-3xl border border-amber/20 bg-panel" />
          ))}
        </div>
      ) : (
        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-5">
          <PracticeStatTile
            label="Interviews Completed"
            value={String(performance?.interviewsCompleted ?? 0)}
            icon={CheckCircle2}
          />
          <PracticeStatTile
            label="Total Practice Time"
            value={formatMinutes(performance?.totalPracticeSeconds ?? 0)}
            icon={Clock}
          />
          <PracticeStatTile
            label="Current Streak"
            value={`${performance?.currentStreak ?? 0} days`}
            icon={Flame}
          />
          <PracticeStatTile
            label="Categories Attempted"
            value={String(performance?.categoriesAttempted ?? 0)}
            icon={Layers}
          />
          <PracticeStatTile
            label="Roles Practised"
            value={String(performance?.rolesPractised ?? 0)}
            icon={Users}
          />
        </div>
      )}

      <h2 className="mb-4 text-lg font-semibold text-slate">Recommended Interview Sets</h2>

      {setsLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-3xl border border-amber/20 bg-panel" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {recommended.map((set) => (
            <InterviewSetCard key={set.id} set={set} />
          ))}
        </div>
      )}
    </div>
  );
}
