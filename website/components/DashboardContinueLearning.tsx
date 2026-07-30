import Link from "next/link";
import { BookOpen, Flame } from "lucide-react";
import type { ContinueLearningData } from "@/types/learning";

export default function DashboardContinueLearning({
  data,
  loading,
}: {
  data: ContinueLearningData | null;
  loading: boolean;
}) {
  return (
    <div className="rounded-3xl border border-amber/20 bg-panel p-7 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-panel-2">
        <BookOpen size={24} className="text-amber" />
      </div>

      <h3 className="mt-6 text-lg font-semibold text-slate">Continue Learning</h3>

      {loading ? (
        <div className="mt-3 h-6 w-3/4 animate-pulse rounded bg-panel-2" />
      ) : data ? (
        <>
          <p className="mt-1 text-xl font-bold text-bone">{data.courseTitle}</p>

          <p className="mt-1 text-sm text-slate">
            {data.progressPercent}% complete
            {data.lastLessonTitle ? ` · Last: ${data.lastLessonTitle}` : ""}
          </p>

          {data.currentStreak > 0 && (
            <p className="mt-2 flex items-center gap-1 text-sm font-semibold text-amber">
              <Flame size={16} />
              {data.currentStreak}-day streak
            </p>
          )}

          <Link
            href={`/learning/${data.courseSlug}/${data.resumeSlug}`}
            className="mt-4 inline-block rounded-xl bg-amber px-5 py-2.5 font-semibold text-white transition hover:bg-amber-dim"
          >
            Continue
          </Link>
        </>
      ) : (
        <>
          <p className="mt-1 text-sm text-slate">
            You haven&apos;t started a learning path yet.
          </p>

          <Link
            href="/learning"
            className="mt-3 inline-block text-sm font-semibold text-amber hover:underline"
          >
            Choose your first path →
          </Link>
        </>
      )}
    </div>
  );
}
