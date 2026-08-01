"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import PracticeQuestionCard from "./PracticeQuestionCard";
import PracticeCompletionScreen from "./PracticeCompletionScreen";
import BookmarkButton from "./BookmarkButton";
import ReportQuestionButton from "./ReportQuestionButton";
import { usePracticeBookmarks } from "@/hooks/usePracticeBookmarks";
import type { PracticeAttemptResult, PracticeAttemptSession } from "@/types/practice";

function formatClock(totalSeconds: number): string {
  const clamped = Math.max(0, totalSeconds);
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function PracticeQuestionRunner({
  startEndpoint,
  attemptsBase,
  timerVariant,
  durationMinutes,
  onSessionEnd,
}: {
  startEndpoint: string;
  attemptsBase: string;
  timerVariant: "stopwatch" | "countdown";
  durationMinutes?: number;
  onSessionEnd?: () => void;
}) {
  const [session, setSession] = useState<PracticeAttemptSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<PracticeAttemptResult | null>(null);
  const hasAutoSubmitted = useRef(false);

  const { data: bookmarks, refetch: refetchBookmarks } = usePracticeBookmarks();
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

      const newSession: PracticeAttemptSession = json.session;
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
      const res = await fetch(`${attemptsBase}/${session.attemptId}/complete`, {
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
  }, [session, submitting, attemptsBase, elapsedSeconds, onSessionEnd]);

  const remainingSeconds =
    timerVariant === "countdown" && durationMinutes ? durationMinutes * 60 - elapsedSeconds : null;

  useEffect(() => {
    if (
      timerVariant === "countdown" &&
      remainingSeconds !== null &&
      remainingSeconds <= 0 &&
      !hasAutoSubmitted.current &&
      !result
    ) {
      hasAutoSubmitted.current = true;
      handleSubmit();
    }
  }, [timerVariant, remainingSeconds, result, handleSubmit]);

  function saveAnswer(questionId: string, next: string[]) {
    setAnswers((prev) => ({ ...prev, [questionId]: next }));

    if (!session) return;

    fetch(`${attemptsBase}/${session.attemptId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId, optionIds: next }),
    }).catch(() => {});
  }

  function toggleOption(questionId: string, optionId: string, questionType: string) {
    const current = answers[questionId] ?? [];

    const next =
      questionType === "multiple_select"
        ? current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId]
        : [optionId];

    saveAnswer(questionId, next);
  }

  function setTextAnswer(questionId: string, text: string) {
    saveAnswer(questionId, [text]);
  }

  async function toggleBookmark(questionId: string) {
    const isBookmarked = bookmarkedIds.has(questionId);

    if (isBookmarked) {
      await fetch(`/api/practice/bookmarks/${questionId}`, { method: "DELETE" });
    } else {
      await fetch("/api/practice/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId }),
      });
    }

    refetchBookmarks();
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
      <PracticeCompletionScreen
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
            timerVariant === "countdown" && (remainingSeconds ?? 0) <= 60
              ? "bg-red-400/10 text-red-400"
              : "bg-panel-2 text-bone"
          }`}
        >
          <Clock size={16} />
          {timerVariant === "countdown"
            ? formatClock(remainingSeconds ?? 0)
            : formatClock(elapsedSeconds)}
        </div>
      </div>

      <div className="mt-8">
        <PracticeQuestionCard
          question={question}
          selectedOptionIds={answers[question.id] ?? []}
          onToggle={(optionId) => toggleOption(question.id, optionId, question.questionType)}
          onTextChange={(text) => setTextAnswer(question.id, text)}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <BookmarkButton
          bookmarked={bookmarkedIds.has(question.id)}
          onToggle={() => toggleBookmark(question.id)}
        />

        <ReportQuestionButton key={question.id} questionId={question.id} />
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
            {submitting ? "Submitting..." : "Submit"}
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
