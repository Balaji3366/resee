"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import InterviewQuestionCard from "./InterviewQuestionCard";
import InterviewCompletionScreen from "./InterviewCompletionScreen";
import BookmarkButton from "@/components/practice/BookmarkButton";
import { useInterviewBookmarks } from "@/hooks/useInterviewBookmarks";
import type { InterviewAttemptResult, InterviewAttemptSession } from "@/types/interview";

function formatClock(totalSeconds: number): string {
  const clamped = Math.max(0, totalSeconds);
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function InterviewSessionRunner({
  startEndpoint,
  durationMinutes,
  onSessionEnd,
}: {
  startEndpoint: string;
  /** When provided, the session counts down from this duration and
   *  auto-submits at zero — otherwise it's a plain count-up stopwatch
   *  with no time limit (the original v1 behavior). */
  durationMinutes?: number;
  onSessionEnd?: () => void;
}) {
  const [session, setSession] = useState<InterviewAttemptSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<InterviewAttemptResult | null>(null);
  const hasAutoSubmitted = useRef(false);

  const { data: bookmarks, refetch: refetchBookmarks } = useInterviewBookmarks();
  const bookmarkedIds = useMemo(() => new Set((bookmarks ?? []).map((b) => b.id)), [bookmarks]);

  const startSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    hasAutoSubmitted.current = false;

    try {
      const res = await fetch(startEndpoint, { method: "POST" });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to start session.");
      }

      const newSession: InterviewAttemptSession = json.session;
      setSession(newSession);
      setAnswers(newSession.answers);
      setCurrentIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start session.");
    } finally {
      setLoading(false);
    }
  }, [startEndpoint]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    startSession();
  }, [startSession]);

  useEffect(() => {
    if (!session || result) return;

    const startedAtMs = new Date(session.startedAt).getTime();

    const tick = () => {
      setElapsedSeconds(Math.max(0, Math.round((Date.now() - startedAtMs) / 1000)));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [session, result]);

  const handleSubmit = useCallback(async () => {
    if (!session || submitting) return;

    setSubmitting(true);

    try {
      const res = await fetch(`/api/interviews/attempts/${session.attemptId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timeTakenSeconds: elapsedSeconds }),
      });
      const json = await res.json();

      if (json.success) {
        setResult(json.result);
        onSessionEnd?.();
      }
    } finally {
      setSubmitting(false);
    }
  }, [session, submitting, elapsedSeconds, onSessionEnd]);

  const remainingSeconds = durationMinutes ? durationMinutes * 60 - elapsedSeconds : null;

  useEffect(() => {
    if (
      durationMinutes &&
      remainingSeconds !== null &&
      remainingSeconds <= 0 &&
      !hasAutoSubmitted.current &&
      !result
    ) {
      hasAutoSubmitted.current = true;
      handleSubmit();
    }
  }, [durationMinutes, remainingSeconds, result, handleSubmit]);

  async function toggleBookmark(questionId: string) {
    const isBookmarked = bookmarkedIds.has(questionId);

    if (isBookmarked) {
      await fetch(`/api/interviews/bookmarks/${questionId}`, { method: "DELETE" });
    } else {
      await fetch("/api/interviews/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId }),
      });
    }

    refetchBookmarks();
  }

  function updateAnswer(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));

    if (!session) return;

    fetch(`/api/interviews/attempts/${session.attemptId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId, answer: value }),
    }).catch(() => {});
  }

  if (loading) {
    return <div className="h-96 animate-pulse rounded-3xl border border-amber/20 bg-panel" />;
  }

  if (error || !session) {
    return (
      <div className="rounded-3xl border border-amber/20 bg-panel p-8 text-center text-slate shadow-md">
        {error || "Couldn't start this session."}
      </div>
    );
  }

  if (result) {
    return (
      <InterviewCompletionScreen
        result={result}
        questions={session.questions}
        answers={answers}
        onRestart={startSession}
      />
    );
  }

  const question = session.questions[currentIndex];
  const total = session.questions.length;
  const isLast = currentIndex === total - 1;

  return (
    <div className="rounded-3xl border border-amber/20 bg-panel p-8 shadow-md">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="h-2 rounded-full bg-panel-2">
            <div
              className="h-2 rounded-full bg-amber transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
            />
          </div>

          <p className="mt-2 text-sm text-slate">
            Question {currentIndex + 1} of {total}
          </p>
        </div>

        <div
          className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${
            durationMinutes && (remainingSeconds ?? 0) <= 60
              ? "bg-red-400/10 text-red-400"
              : "bg-panel-2 text-white"
          }`}
        >
          <Clock size={16} />
          {durationMinutes ? formatClock(remainingSeconds ?? 0) : formatClock(elapsedSeconds)}
        </div>
      </div>

      <div className="mt-8">
        <InterviewQuestionCard
          question={question}
          answer={answers[question.id] ?? ""}
          onChange={(value) => updateAnswer(question.id, value)}
        />
      </div>

      <div className="mt-6">
        <BookmarkButton
          bookmarked={bookmarkedIds.has(question.id)}
          onToggle={() => toggleBookmark(question.id)}
        />
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        {currentIndex > 0 ? (
          <button
            onClick={() => setCurrentIndex((i) => i - 1)}
            className="flex items-center gap-2 rounded-xl border border-bone/15 px-5 py-3 font-semibold text-bone transition hover:border-amber"
          >
            <ArrowLeft size={18} />
            Previous
          </button>
        ) : (
          <span />
        )}

        {isLast ? (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-xl bg-amber px-6 py-3 font-bold text-white transition hover:bg-amber-dim disabled:opacity-60"
          >
            {submitting ? "Finishing..." : "Finish Interview"}
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex((i) => i + 1)}
            className="flex items-center gap-2 rounded-xl bg-amber px-6 py-3 font-bold text-white transition hover:bg-amber-dim"
          >
            Next
            <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
