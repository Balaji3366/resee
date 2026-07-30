import Link from "next/link";
import type { InterviewSetSummary } from "@/types/interview";

export default function InterviewSetCard({ set }: { set: InterviewSetSummary }) {
  const card = (
    <div
      className={`h-full rounded-3xl border p-7 shadow-md transition-all duration-300 ${
        set.isAvailable
          ? "border-amber/20 bg-panel hover:-translate-y-2 hover:shadow-2xl"
          : "border-dashed border-bone/15 bg-panel"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 text-2xl">
          <span>{set.category.icon}</span>
          <span>{set.role.icon}</span>
        </div>

        {!set.isAvailable && (
          <span className="shrink-0 rounded-full bg-panel-2 px-3 py-1 text-xs font-bold text-slate">
            Coming Soon
          </span>
        )}
      </div>

      <h3 className="mt-4 text-xl font-bold text-bone">{set.title}</h3>
      <p className="mt-2 text-sm text-slate">{set.description}</p>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate">
        <span className="rounded-full bg-panel-2 px-3 py-1 capitalize">{set.difficulty}</span>
        <span className="rounded-full bg-panel-2 px-3 py-1">{set.estimatedMinutes} min</span>
        <span className="rounded-full bg-panel-2 px-3 py-1">{set.questionCount} questions</span>
      </div>

      {set.isAvailable && set.completedCount > 0 && (
        <p className="mt-4 text-sm font-semibold text-amber">
          Completed {set.completedCount} time{set.completedCount === 1 ? "" : "s"}
        </p>
      )}
    </div>
  );

  if (!set.isAvailable) {
    return (
      <button type="button" onClick={() => alert("🚧 Coming Soon")} className="text-left">
        {card}
      </button>
    );
  }

  return <Link href={`/interviews/${set.slug}`}>{card}</Link>;
}
