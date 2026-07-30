import { CalendarCheck, Flame, Trophy } from "lucide-react";
import PracticeStatTile from "@/components/practice/PracticeStatTile";
import type { ProgressOverview } from "@/types/progress";

export default function LearningStreakSection({ overview }: { overview: ProgressOverview }) {
  return (
    <div className="rounded-3xl border border-amber/20 bg-panel p-7 shadow-md">
      <h2 className="text-lg font-semibold text-slate">Learning Streak</h2>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <PracticeStatTile
          label="Current Streak"
          value={`${overview.currentStreak} day${overview.currentStreak === 1 ? "" : "s"}`}
          icon={Flame}
        />
        <PracticeStatTile
          label="Best Streak"
          value={`${overview.bestStreak} day${overview.bestStreak === 1 ? "" : "s"}`}
          icon={Trophy}
        />
        <PracticeStatTile
          label="Total Active Days"
          value={String(overview.totalActiveDays)}
          icon={CalendarCheck}
        />
      </div>
    </div>
  );
}
