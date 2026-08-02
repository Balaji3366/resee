"use client";

import { use, useState } from "react";
import { Clock, Infinity as InfinityIcon } from "lucide-react";
import InterviewSessionRunner from "@/components/interviews/InterviewSessionRunner";
import { useInterviewSet } from "@/hooks/useInterviewSet";

export default function InterviewSetPage({ params }: { params: Promise<{ setSlug: string }> }) {
  const { setSlug } = use(params);

  const { data: set, loading, error, refetch } = useInterviewSet(setSlug);
  const [timedMode, setTimedMode] = useState<"untimed" | "timed" | null>(null);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="h-96 animate-pulse rounded-3xl border border-amber/20 bg-panel" />
      </div>
    );
  }

  if (error || !set || !set.isAvailable) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-amber/20 bg-panel p-8 text-center text-slate shadow-md">
          {!set ? "Couldn't find this interview." : "This interview isn't available yet."}
        </div>
      </div>
    );
  }

  if (!timedMode) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-amber/20 bg-panel p-8 shadow-md">
          <h2 className="font-display text-2xl font-bold text-bone">{set.title}</h2>
          <p className="mt-2 text-slate">
            Choose how you&apos;d like to practice. You can always retake this later.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <button
              onClick={() => setTimedMode("untimed")}
              className="rounded-2xl border border-bone/15 p-6 text-left transition hover:border-amber"
            >
              <InfinityIcon className="text-amber" size={22} />
              <p className="mt-3 font-bold text-bone">Untimed Practice</p>
              <p className="mt-1 text-sm text-slate">
                Take as long as you need to think through each answer.
              </p>
            </button>

            <button
              onClick={() => setTimedMode("timed")}
              className="rounded-2xl border border-bone/15 p-6 text-left transition hover:border-amber"
            >
              <Clock className="text-amber" size={22} />
              <p className="mt-3 font-bold text-bone">Timed Challenge</p>
              <p className="mt-1 text-sm text-slate">
                {set.estimatedMinutes}-minute countdown, simulating real interview pressure.
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <InterviewSessionRunner
        startEndpoint={`/api/interviews/sets/${setSlug}/attempt/start`}
        durationMinutes={timedMode === "timed" ? set.estimatedMinutes : undefined}
        onSessionEnd={refetch}
      />
    </div>
  );
}
