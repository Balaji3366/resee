import Link from "next/link";
import type { MockTestSummary } from "@/types/practice";

export default function MockTestCard({ test }: { test: MockTestSummary }) {
  const card = (
    <div
      className={`h-full rounded-3xl border p-7 shadow-md transition-all duration-300 ${
        test.isAvailable
          ? "border-amber/20 bg-panel hover:-translate-y-2 hover:shadow-2xl"
          : "border-dashed border-bone/15 bg-panel"
      }`}
    >
      <div className="flex items-start justify-between">
        <h3 className="text-xl font-bold text-bone">{test.title}</h3>

        {!test.isAvailable && (
          <span className="shrink-0 rounded-full bg-panel-2 px-3 py-1 text-xs font-bold text-slate">
            Coming Soon
          </span>
        )}
      </div>

      <p className="mt-2 text-sm text-slate">{test.description}</p>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate">
        <span className="rounded-full bg-panel-2 px-3 py-1 capitalize">{test.difficulty}</span>
        <span className="rounded-full bg-panel-2 px-3 py-1">{test.durationMinutes} min</span>
        <span className="rounded-full bg-panel-2 px-3 py-1">{test.totalQuestions} questions</span>
      </div>

      {test.isAvailable && test.bestScore !== null && (
        <p className="mt-4 text-sm font-semibold text-amber">Best score: {test.bestScore}%</p>
      )}
    </div>
  );

  if (!test.isAvailable) {
    return (
      <button type="button" onClick={() => alert("🚧 Coming Soon")} className="text-left">
        {card}
      </button>
    );
  }

  return <Link href={`/practice/mock-tests/${test.slug}`}>{card}</Link>;
}
