import Link from "next/link";
import { Flame } from "lucide-react";
import type { ContinueLearningData } from "@/types/learning";

export default function DashboardContinueLearning({
  data,
  loading,
}: {
  data: ContinueLearningData | null;
  loading: boolean;
}) {
  return (
    <div className="rounded-[20px] border-2 border-bone bg-panel p-6">
      <p className="text-sm font-bold text-bone/50">Continue Learning</p>

      {loading ? (
        <div className="mt-2 h-6 w-3/4 animate-pulse rounded bg-panel-2" />
      ) : data ? (
        <>
          <p className="mt-2 text-[17px] font-bold text-bone">{data.courseTitle}</p>

          <p className="mt-1 text-xs text-bone/45">
            {data.progressPercent}% complete
            {data.lastLessonTitle ? ` · Last: ${data.lastLessonTitle}` : ""}
          </p>

          {data.currentStreak > 0 && (
            <p className="mt-2 flex items-center gap-1 text-sm font-bold text-amber">
              <Flame size={16} />
              {data.currentStreak}-day streak
            </p>
          )}

          <Link
            href={`/learning/${data.courseSlug}/${data.resumeSlug}`}
            className="mt-3 inline-block rounded-full bg-amber px-5 py-2 text-sm font-bold text-ink transition hover:scale-[1.03]"
          >
            Continue
          </Link>
        </>
      ) : (
        <>
          <p className="mt-2 text-sm text-bone/60">You haven&apos;t started a learning path yet.</p>

          <Link
            href="/learning"
            className="mt-2 inline-block text-sm font-bold text-amber hover:underline"
          >
            Choose your first path →
          </Link>
        </>
      )}
    </div>
  );
}
