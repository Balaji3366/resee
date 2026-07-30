import type { PracticeHistoryEntry } from "@/types/practice";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export default function PracticeHistoryList({
  entries,
  onReview,
}: {
  entries: PracticeHistoryEntry[];
  onReview: (entry: PracticeHistoryEntry) => void;
}) {
  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber/20 bg-panel p-5 shadow-md"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-panel-2 px-2.5 py-0.5 text-xs font-bold text-slate">
                {entry.kind === "topic" ? "Topic" : "Mock Test"}
              </span>
              <p className="truncate font-semibold text-bone">{entry.title}</p>
            </div>

            <p className="mt-1 text-sm text-slate">
              {formatDate(entry.attemptedAt)} · {entry.correctCount}/{entry.totalQuestions} correct ·{" "}
              {formatTime(entry.timeTakenSeconds)}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-4">
            <p className="text-xl font-extrabold text-bone">{entry.score}%</p>

            <button
              onClick={() => onReview(entry)}
              className="rounded-xl border border-bone/15 px-4 py-2 text-sm font-semibold text-bone transition hover:border-amber"
            >
              Review
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
