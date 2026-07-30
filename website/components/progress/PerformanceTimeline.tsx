import { BookOpen, CheckCircle2, ClipboardList, GraduationCap, Target } from "lucide-react";
import type { TimelineEntry, TimelineEventKind } from "@/types/progress";

const ICONS: Record<TimelineEventKind, typeof BookOpen> = {
  lesson_completed: BookOpen,
  quiz_passed: CheckCircle2,
  mock_test_completed: ClipboardList,
  course_completed: GraduationCap,
  practice_completed: Target,
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function PerformanceTimeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <div className="rounded-3xl border border-amber/20 bg-panel p-7 shadow-md">
      <h2 className="text-lg font-semibold text-slate">Performance Timeline</h2>

      {entries.length === 0 ? (
        <p className="mt-4 text-sm text-slate">Your activity will show up here as you go.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {entries.map((entry, i) => {
            const Icon = ICONS[entry.kind];

            return (
              <div key={`${entry.occurredAt}-${i}`} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-panel-2">
                  <Icon size={16} className="text-amber" />
                </div>

                <div>
                  <p className="font-semibold text-bone">{entry.title}</p>
                  <p className="text-xs text-slate">{formatDate(entry.occurredAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
