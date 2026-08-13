"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { GOAL_LABELS, type GoalId } from "@/constants/goals";
import type { ProfileData } from "@/hooks/useProfile";

type DashboardHeroProps = {
  profile: ProfileData | null;
};

function isGoalId(value: string | null): value is GoalId {
  return !!value && value in GOAL_LABELS;
}

/**
 * Compact dashboard greeting — replaces what used to be a large
 * gradient "Welcome back" hero (oversized card, decorative blur/brand
 * mark, two promotional CTAs duplicating routes already in the sidebar
 * and AI Career Tools). This is a header, not a marketing banner: no
 * card background, no CTAs, no decoration — just the greeting, one
 * supporting line, and an optional date. Same useUser()/timeOfDay/
 * goal-subtitle logic as before, nothing new fetched.
 */
export default function DashboardHero({ profile }: DashboardHeroProps) {
  const { user } = useUser();
  const [timeOfDay, setTimeOfDay] = useState<string | null>(null);
  const [dateLabel, setDateLabel] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTimeOfDay(hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening");
    setDateLabel(
      now.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
    );
  }, []);

  const fullName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there";

  const subtitle = isGoalId(profile?.goal ?? null)
    ? `You're one step closer to ${GOAL_LABELS[profile!.goal as GoalId].toLowerCase()}.`
    : "Let's make today count.";

  return (
    <div className="animate-fade-up mb-7 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-bone md:text-[26px]">
          Good {timeOfDay ?? "Day"}, {fullName} 👋
        </h1>

        <p className="mt-1 text-sm text-bone/60">{subtitle}</p>
      </div>

      {dateLabel && (
        <span className="shrink-0 rounded-full bg-panel-2 px-3.5 py-1.5 text-xs font-semibold text-slate">
          {dateLabel}
        </span>
      )}
    </div>
  );
}
