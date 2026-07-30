import { BookOpenCheck, ClipboardCheck, FileCheck2, Flame, ListChecks } from "lucide-react";
import CircularProgressRing from "./CircularProgressRing";
import PracticeStatTile from "@/components/practice/PracticeStatTile";
import type { ProgressOverview } from "@/types/progress";

export default function OverallProgressSection({ overview }: { overview: ProgressOverview }) {
  return (
    <div className="rounded-3xl border border-amber/20 bg-panel p-7 shadow-md">
      <h2 className="text-lg font-semibold text-slate">Overall Progress</h2>

      <div className="mt-6 flex justify-center">
        <CircularProgressRing
          percent={overview.overallCompletionPercent}
          label="Overall Completion"
          size={160}
        />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PracticeStatTile
          label="Current Streak"
          value={`${overview.currentStreak} day${overview.currentStreak === 1 ? "" : "s"}`}
          icon={Flame}
        />
        <PracticeStatTile
          label="Total Learning Hours"
          value={`${overview.totalLearningHours}h`}
          icon={BookOpenCheck}
        />
        <PracticeStatTile
          label="Lessons Completed"
          value={String(overview.lessonsCompleted)}
          icon={ListChecks}
        />
        <PracticeStatTile
          label="Quizzes Completed"
          value={String(overview.quizzesCompleted)}
          icon={ClipboardCheck}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <PracticeStatTile
          label="Mock Tests Completed"
          value={String(overview.mockTestsCompleted)}
          icon={FileCheck2}
        />
        <PracticeStatTile
          label="Practice Questions Solved"
          value={String(overview.practiceQuestionsSolved)}
          icon={ListChecks}
        />
      </div>
    </div>
  );
}
