"use client";

import Link from "next/link";
import { Target } from "lucide-react";
import { GOAL_LABELS, type GoalId } from "@/constants/goals";
import type { ProfileData } from "@/hooks/useProfile";

function isGoalId(value: string | null): value is GoalId {
  return !!value && value in GOAL_LABELS;
}

export default function DashboardGoalCard({
  profile,
  loading,
}: {
  profile: ProfileData | null;
  loading: boolean;
}) {
  return (
    <div className="rounded-3xl border border-amber/20 bg-panel p-7 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-panel-2">
        <Target size={24} className="text-amber" />
      </div>

      <h3 className="mt-6 text-lg font-semibold text-slate">
        My Goal
      </h3>

      {loading ? (
        <div className="mt-3 h-6 w-3/4 animate-pulse rounded bg-panel-2" />
      ) : isGoalId(profile?.goal ?? null) ? (
        <>
          <p className="mt-1 text-xl font-bold text-bone">
            {GOAL_LABELS[profile!.goal as GoalId]}
          </p>

          {profile?.targetCareer && (
            <p className="mt-1 text-sm text-slate">
              Target: {profile.targetCareer}
            </p>
          )}
        </>
      ) : (
        <>
          <p className="mt-1 text-sm text-slate">
            You haven&apos;t set a goal yet.
          </p>

          <Link
            href="/settings"
            className="mt-3 inline-block text-sm font-semibold text-amber hover:underline"
          >
            Set your goal →
          </Link>
        </>
      )}
    </div>
  );
}
