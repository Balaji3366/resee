"use client";

import Link from "next/link";
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
    <div className="rounded-[20px] border-2 border-bone bg-panel p-6">
      <p className="text-sm font-bold text-bone/50">My Goal</p>

      {loading ? (
        <div className="mt-2 h-6 w-3/4 animate-pulse rounded bg-panel-2" />
      ) : isGoalId(profile?.goal ?? null) ? (
        <>
          <p className="mt-2 text-[17px] font-bold text-bone">
            {GOAL_LABELS[profile!.goal as GoalId]}
          </p>

          {profile?.targetCareer && (
            <p className="mt-1 text-xs text-bone/45">Target: {profile.targetCareer}</p>
          )}
        </>
      ) : (
        <>
          <p className="mt-2 text-sm text-bone/60">You haven&apos;t set a goal yet.</p>

          <Link
            href="/settings"
            className="mt-2 inline-block text-sm font-bold text-amber hover:underline"
          >
            Set your goal →
          </Link>
        </>
      )}
    </div>
  );
}
