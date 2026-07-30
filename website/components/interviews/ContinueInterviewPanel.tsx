import Link from "next/link";
import type { ContinueInterviewItem } from "@/types/interview";

export default function ContinueInterviewPanel({
  items,
  loading,
}: {
  items: ContinueInterviewItem[] | null;
  loading: boolean;
}) {
  if (loading) {
    return <div className="mb-10 h-28 animate-pulse rounded-3xl border border-amber/20 bg-panel" />;
  }

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="mb-10 rounded-3xl border border-amber/20 bg-panel p-7 shadow-md">
      <h2 className="text-lg font-semibold text-slate">Continue Last Interview</h2>

      <div className="mt-4 space-y-4">
        {items.map((item) => (
          <div
            key={item.attemptId}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-bone/10 bg-ink p-4"
          >
            <div className="min-w-0">
              <p className="truncate font-semibold text-bone">{item.title}</p>
              <p className="mt-1 text-sm text-slate">
                {item.progressPercent}% complete · {item.questionsRemaining} question
                {item.questionsRemaining === 1 ? "" : "s"} remaining
              </p>

              <div className="mt-2 h-1.5 w-48 max-w-full rounded-full bg-panel-2">
                <div
                  className="h-1.5 rounded-full bg-amber transition-all duration-700"
                  style={{ width: `${item.progressPercent}%` }}
                />
              </div>
            </div>

            <Link
              href={`/interviews/${item.slug}`}
              className="shrink-0 rounded-xl bg-amber px-5 py-2.5 font-semibold text-white transition hover:bg-amber-dim"
            >
              Continue
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
