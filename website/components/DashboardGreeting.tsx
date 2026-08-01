"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { GOAL_LABELS, type GoalId } from "@/constants/goals";
import type { ProfileData } from "@/hooks/useProfile";

function isGoalId(value: string | null): value is GoalId {
  return !!value && value in GOAL_LABELS;
}

export default function DashboardGreeting({ profile }: { profile: ProfileData | null }) {
  const { user } = useUser();
  const [timeOfDay, setTimeOfDay] = useState<string | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();

    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (hour < 12) setTimeOfDay("Morning");
    else if (hour < 18) setTimeOfDay("Afternoon");
    else setTimeOfDay("Evening");
  }, []);

  const fullName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there";

  const subtitle = isGoalId(profile?.goal ?? null)
    ? `You're one step closer to ${GOAL_LABELS[profile!.goal as GoalId].toLowerCase()}.`
    : "Let's make today count.";

  return (
    <div className="animate-fade-up mb-7">
      <h1 className="font-display text-[34px] font-extrabold tracking-tight text-bone">
        Good {timeOfDay ?? "Day"}, {fullName} 👋
      </h1>

      <p className="mt-2 text-bone/60">{subtitle}</p>
    </div>
  );
}
