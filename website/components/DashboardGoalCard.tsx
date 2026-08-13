"use client";

import Link from "next/link";
import { Target } from "lucide-react";
import IconBadge from "@/components/ui/IconBadge";
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
    <div>
      <div className="flex items-center gap-2.5">
        <IconBadge color="amber" size={32}>
          <Target size={15} />
        </IconBadge>

        <p className="text-sm font-bold text-bone/50">My Goal</p>
      </div>

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
