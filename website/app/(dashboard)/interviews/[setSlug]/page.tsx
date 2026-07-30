"use client";

import { use, useEffect, useState } from "react";
import InterviewSessionRunner from "@/components/interviews/InterviewSessionRunner";
import { useInterviewSet } from "@/hooks/useInterviewSet";

export default function InterviewSetPage({
  params,
}: {
  params: Promise<{ setSlug: string }>;
}) {
  const { setSlug } = use(params);

  const [sessionActive, setSessionActive] = useState(false);

  const { data: set, loading, error, refetch } = useInterviewSet(setSlug);

  useEffect(() => {
    if (set?.inProgressAttemptId && !sessionActive) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSessionActive(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [set?.inProgressAttemptId]);

  return (
    <div className="mx-auto max-w-3xl">
      {sessionActive ? (
        <InterviewSessionRunner
          startEndpoint={`/api/interviews/sets/${setSlug}/attempt/start`}
          onSessionEnd={refetch}
        />
      ) : (
        <>
          {loading && <div className="h-64 animate-pulse rounded-3xl border border-amber/20 bg-panel" />}

          {!loading && (error || !set) && (
            <div className="rounded-3xl border border-amber/20 bg-panel p-8 text-center text-slate shadow-md">
              Couldn&apos;t find this interview set.
            </div>
          )}
        </>
      )}

      {!sessionActive && !loading && set && (
        <div className="rounded-3xl border border-amber/20 bg-panel p-8 shadow-md">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-4xl">
                <span>{set.category.icon}</span>
                <span>{set.role.icon}</span>
              </div>

              <h1 className="font-display mt-4 text-3xl font-extrabold text-bone">{set.title}</h1>
              <p className="mt-2 text-slate">{set.description}</p>
            </div>

            {!set.isAvailable && (
              <span className="shrink-0 rounded-full bg-panel-2 px-3 py-1 text-xs font-bold text-slate">
                Coming Soon
              </span>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-panel-2 px-4 py-2 text-slate">{set.category.name}</span>
            <span className="rounded-full bg-panel-2 px-4 py-2 text-slate">{set.role.name}</span>
            <span className="rounded-full bg-panel-2 px-4 py-2 capitalize text-slate">
              {set.difficulty}
            </span>
            <span className="rounded-full bg-panel-2 px-4 py-2 text-slate">
              {set.questionCount} questions
            </span>
            <span className="rounded-full bg-panel-2 px-4 py-2 text-slate">
              ~{set.estimatedMinutes} min
            </span>
          </div>

          {set.isAvailable && set.completedCount > 0 && (
            <p className="mt-6 text-sm text-slate">
              You&apos;ve completed this interview {set.completedCount} time
              {set.completedCount === 1 ? "" : "s"}.
            </p>
          )}

          <div className="mt-8">
            {!set.isAvailable ? (
              <button
                disabled
                className="w-full cursor-not-allowed rounded-xl bg-panel-2 py-4 text-lg font-bold text-slate"
              >
                Coming Soon
              </button>
            ) : (
              <button
                onClick={() => setSessionActive(true)}
                className="w-full rounded-xl bg-amber py-4 text-lg font-bold text-white transition hover:bg-amber-dim"
              >
                Start Interview
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
