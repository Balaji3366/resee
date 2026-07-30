"use client";

import { useState } from "react";
import Link from "next/link";
import InterviewHistoryList from "@/components/interviews/InterviewHistoryList";
import InterviewCompletionScreen from "@/components/interviews/InterviewCompletionScreen";
import ConfirmModal from "@/components/ConfirmModal";
import { useInterviewHistory } from "@/hooks/useInterviewHistory";
import { useContinueInterviews } from "@/hooks/useContinueInterviews";
import type { InterviewAttemptResult, InterviewHistoryEntry, InterviewQuestionPublic } from "@/types/interview";

export default function InterviewHistoryPage() {
  const { data: entries, loading } = useInterviewHistory();
  const { data: continueItems, loading: continueLoading } = useContinueInterviews();

  const [localEntries, setLocalEntries] = useState<InterviewHistoryEntry[] | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [review, setReview] = useState<{
    questions: InterviewQuestionPublic[];
    answers: Record<string, string>;
    result: InterviewAttemptResult;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InterviewHistoryEntry | null>(null);
  const [deleting, setDeleting] = useState(false);

  const displayEntries = localEntries ?? entries;

  async function handleReview(entry: InterviewHistoryEntry) {
    setReviewLoading(true);

    try {
      const res = await fetch(`/api/interviews/history/${entry.id}`);
      const json = await res.json();

      if (json.success) {
        const questions: InterviewQuestionPublic[] = json.detail.answers.map(
          (a: { questionId: string; question: string; questionType: string; sortOrder: number }) => ({
            id: a.questionId,
            question: a.question,
            questionType: a.questionType,
            sortOrder: a.sortOrder,
          })
        );

        const answers: Record<string, string> = {};
        for (const a of json.detail.answers) {
          answers[a.questionId] = a.answer;
        }

        const completedQuestions = Object.values(answers).filter((a) => a.trim().length > 0).length;

        setReview({
          questions,
          answers,
          result: {
            totalQuestions: questions.length,
            completedQuestions,
            timeTakenSeconds: json.detail.timeTakenSeconds,
            completionStatus: "completed",
          },
        });
      }
    } finally {
      setReviewLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      const res = await fetch(`/api/interviews/attempts/${deleteTarget.id}`, { method: "DELETE" });
      const json = await res.json();

      if (json.success) {
        setLocalEntries((displayEntries ?? []).filter((e) => e.id !== deleteTarget.id));
        setDeleteTarget(null);
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-bone md:text-4xl">
          Interview History
        </h1>
        <p className="mt-2 text-slate">Review your past interviews and resume any you left incomplete.</p>
      </div>

      {review ? (
        <InterviewCompletionScreen
          result={review.result}
          questions={review.questions}
          answers={review.answers}
          onRestart={() => setReview(null)}
        />
      ) : (
        <>
          {!continueLoading && continueItems && continueItems.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4 text-lg font-semibold text-slate">Resume Incomplete</h2>
              <div className="space-y-3">
                {continueItems.map((item) => (
                  <div
                    key={item.attemptId}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber/20 bg-panel p-5 shadow-md"
                  >
                    <div>
                      <p className="font-semibold text-bone">{item.title}</p>
                      <p className="mt-1 text-sm text-slate">
                        {item.progressPercent}% complete · {item.questionsRemaining} remaining
                      </p>
                    </div>
                    <Link
                      href={`/interviews/${item.slug}`}
                      className="rounded-xl bg-amber px-5 py-2.5 font-semibold text-white transition hover:bg-amber-dim"
                    >
                      Resume
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          <h2 className="mb-4 text-lg font-semibold text-slate">Completed Interviews</h2>

          {(loading || reviewLoading) && (
            <div className="h-64 animate-pulse rounded-3xl border border-amber/20 bg-panel" />
          )}

          {!loading && !reviewLoading && displayEntries && displayEntries.length === 0 && (
            <div className="rounded-3xl border border-dashed border-bone/15 bg-panel p-8 text-center shadow-md">
              <p className="text-slate">You haven&apos;t completed any interviews yet.</p>
            </div>
          )}

          {!loading && !reviewLoading && displayEntries && displayEntries.length > 0 && (
            <InterviewHistoryList
              entries={displayEntries}
              onReview={handleReview}
              onDelete={(entry) => setDeleteTarget(entry)}
            />
          )}
        </>
      )}

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete this interview?"
        message="This will permanently delete this interview and your answers. This cannot be undone."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
