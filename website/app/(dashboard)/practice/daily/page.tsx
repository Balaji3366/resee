"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarClock } from "lucide-react";
import PracticeQuestionRunner from "@/components/practice/PracticeQuestionRunner";
import type { DailyChallengeSummary } from "@/types/practice";

export default function DailyChallengePage() {
  const [challenge, setChallenge] = useState<DailyChallengeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/practice/daily");
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load today's challenge.");
      }

      setChallenge(json.challenge);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load today's challenge.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/practice"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-amber hover:underline"
      >
        <ArrowLeft size={16} />
        Back to Practice
      </Link>

      {loading && (
        <div className="h-64 animate-pulse rounded-3xl border border-amber/20 bg-panel" />
      )}

      {!loading && (error || !challenge) && (
        <div className="rounded-3xl border border-amber/20 bg-panel p-8 text-center text-slate shadow-md">
          {error || "Couldn't load today's challenge."}
        </div>
      )}

      {!loading && challenge && challenge.status === "completed" && (
        <div className="rounded-3xl border border-amber/20 bg-panel p-8 text-center shadow-md">
          <CalendarClock className="mx-auto mb-4 text-amber" size={32} />

          <h2 className="font-display text-2xl font-bold text-bone">
            Today&apos;s challenge is done!
          </h2>

          <p className="mt-2 text-slate">
            You scored {challenge.score}% today. Come back tomorrow for a fresh set of questions.
          </p>
        </div>
      )}

      {!loading && challenge && challenge.status !== "completed" && (
        <>
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold text-bone">Daily Challenge</h1>
            <p className="mt-1 text-slate">
              {challenge.totalQuestions} questions, refreshed for everyone every day.
            </p>
          </div>

          <PracticeQuestionRunner
            startEndpoint="/api/practice/daily/start"
            attemptsBase="/api/practice/daily-attempts"
            timerVariant="stopwatch"
            onSessionEnd={load}
          />
        </>
      )}
    </div>
  );
}
