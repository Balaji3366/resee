import { BookOpenCheck, Clock, GraduationCap, Layers } from "lucide-react";
import PracticeStatTile from "@/components/practice/PracticeStatTile";
import type { MonthActivityPoint } from "@/types/progress";

export default function MonthlyActivitySection({ monthly }: { monthly: MonthActivityPoint[] }) {
  const current = monthly[monthly.length - 1] ?? {
    monthStart: "",
    learningHours: 0,
    practiceMinutes: 0,
    completedCourses: 0,
    completedModules: 0,
  };

  return (
    <div className="rounded-3xl border border-amber/20 bg-panel p-7 shadow-md">
      <h2 className="text-lg font-semibold text-slate">Monthly Activity</h2>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PracticeStatTile
          label="Learning Hours"
          value={`${current.learningHours}h`}
          icon={BookOpenCheck}
        />
        <PracticeStatTile
          label="Practice Time"
          value={`${current.practiceMinutes} min`}
          icon={Clock}
        />
        <PracticeStatTile
          label="Completed Courses"
          value={String(current.completedCourses)}
          icon={GraduationCap}
        />
        <PracticeStatTile
          label="Completed Modules"
          value={String(current.completedModules)}
          icon={Layers}
        />
      </div>
    </div>
  );
}
