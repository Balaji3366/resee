"use client";

import { useState } from "react";
import DashboardNavbar from "@/components/DashboardNavbar";
import DashboardSidebar from "@/components/DashboardSidebar";
import PracticeHistoryList from "@/components/practice/PracticeHistoryList";
import PracticeCompletionScreen from "@/components/practice/PracticeCompletionScreen";
import PracticeEmptyState from "@/components/practice/PracticeEmptyState";
import { usePracticeHistory } from "@/hooks/usePracticeHistory";
import { usePracticeCatalog } from "@/hooks/usePracticeCatalog";
import type {
  PracticeAttemptResult,
  PracticeHistoryEntry,
  PracticeQuestionPublic,
} from "@/types/practice";

export default function PracticeHistoryPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [review, setReview] = useState<{
    questions: PracticeQuestionPublic[];
    answers: Record<string, string[]>;
    result: PracticeAttemptResult;
  } | null>(null);

  const { data: entries, loading } = usePracticeHistory();
  const { data: catalog } = usePracticeCatalog();

  async function handleReview(entry: PracticeHistoryEntry) {
    setReviewLoading(true);

    try {
      const res = await fetch(`/api/practice/history/${entry.id}?kind=${entry.kind}`);
      const json = await res.json();

      if (json.success) {
        setReview({ questions: json.questions, answers: json.answers, result: json.result });
      }
    } finally {
      setReviewLoading(false);
    }
  }

  return (
    <section className="min-h-screen bg-ink pt-2 pb-16">
      <div className="mx-auto max-w-[96rem] px-6">
        <div className="flex gap-6 lg:gap-8">
          <DashboardSidebar
            mobileOpen={mobileNavOpen}
            onMobileClose={() => setMobileNavOpen(false)}
          />

          <div className="min-w-0 flex-1">
            <div className="mx-auto max-w-3xl">
              <DashboardNavbar onMenuClick={() => setMobileNavOpen(true)} />

              <div className="mb-8">
                <h1 className="font-display text-3xl font-extrabold text-bone md:text-4xl">
                  Previous Attempts
                </h1>

                <p className="mt-2 text-slate">
                  Review your past sessions and see how you&apos;ve improved.
                </p>
              </div>

              {review ? (
                <PracticeCompletionScreen
                  result={review.result}
                  questions={review.questions}
                  answers={review.answers}
                  onRestart={() => setReview(null)}
                  restartLabel="Back to History"
                />
              ) : (
                <>
                  {(loading || reviewLoading) && (
                    <div className="h-64 animate-pulse rounded-3xl border border-amber/20 bg-panel" />
                  )}

                  {!loading && !reviewLoading && entries && entries.length === 0 && (
                    <PracticeEmptyState
                      categories={catalog?.categories ?? []}
                      message="You haven't completed any practice sessions yet."
                    />
                  )}

                  {!loading && !reviewLoading && entries && entries.length > 0 && (
                    <PracticeHistoryList entries={entries} onReview={handleReview} />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
