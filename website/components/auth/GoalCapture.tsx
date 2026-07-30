"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const PENDING_GOAL_KEY = "resee:pending-onboarding-goal";

export default function GoalCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const goal = searchParams.get("goal");

    if (goal) {
      window.localStorage.setItem(PENDING_GOAL_KEY, goal);
    }
  }, [searchParams]);

  return null;
}
