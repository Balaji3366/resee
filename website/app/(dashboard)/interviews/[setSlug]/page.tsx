"use client";

import { use } from "react";
import InterviewSessionRunner from "@/components/interviews/InterviewSessionRunner";
import { useInterviewSet } from "@/hooks/useInterviewSet";

export default function InterviewSetPage({
  params,
}: {
  params: Promise<{ setSlug: string }>;
}) {
  const { setSlug } = use(params);

  const { data: set, loading, error, refetch } = useInterviewSet(setSlug);

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

  return (
    <div className="mx-auto max-w-3xl">
      <InterviewSessionRunner
        startEndpoint={`/api/interviews/sets/${setSlug}/attempt/start`}
        onSessionEnd={refetch}
      />
    </div>
  );
}
