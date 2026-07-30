"use client";

import { use, useEffect, useState } from "react";
import PracticeQuestionRunner from "@/components/practice/PracticeQuestionRunner";
import { usePracticeTopic } from "@/hooks/usePracticeTopic";

export default function PracticeTopicPage({
  params,
}: {
  params: Promise<{ topicSlug: string }>;
}) {
  const { topicSlug } = use(params);

  const [sessionActive, setSessionActive] = useState(false);

  const { data: topic, loading, error, refetch } = usePracticeTopic(topicSlug);

  useEffect(() => {
    if (topic?.inProgressAttemptId && !sessionActive) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSessionActive(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic?.inProgressAttemptId]);

  return (
    <div className="mx-auto max-w-3xl">
              {sessionActive ? (
                <PracticeQuestionRunner
                  startEndpoint={`/api/practice/topics/${topicSlug}/attempt/start`}
                  attemptsBase="/api/practice/attempts"
                  timerVariant="stopwatch"
                  onSessionEnd={refetch}
                />
              ) : (
                <>
                  {loading && (
                    <div className="h-64 animate-pulse rounded-3xl border border-amber/20 bg-panel" />
                  )}

                  {!loading && (error || !topic) && (
                    <div className="rounded-3xl border border-amber/20 bg-panel p-8 text-center text-slate shadow-md">
                      Couldn&apos;t find this topic.
                    </div>
                  )}
                </>
              )}

              {!sessionActive && !loading && topic && (
                <div className="rounded-3xl border border-amber/20 bg-panel p-8 shadow-md">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <span className="text-4xl">{topic.icon}</span>

                      <h1 className="font-display mt-4 text-3xl font-extrabold text-bone">
                        {topic.title}
                      </h1>

                      <p className="mt-2 text-slate">{topic.description}</p>
                    </div>

                    {!topic.isAvailable && (
                      <span className="shrink-0 rounded-full bg-panel-2 px-3 py-1 text-xs font-bold text-slate">
                        Coming Soon
                      </span>
                    )}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3 text-sm">
                    <span className="rounded-full bg-panel-2 px-4 py-2 capitalize text-slate">
                      {topic.difficulty}
                    </span>
                    <span className="rounded-full bg-panel-2 px-4 py-2 text-slate">
                      {topic.questionCount} questions
                    </span>
                    <span className="rounded-full bg-panel-2 px-4 py-2 text-slate">
                      ~{topic.estimatedMinutes} min
                    </span>
                  </div>

                  {topic.isAvailable && topic.attemptsCount > 0 && (
                    <p className="mt-6 text-sm text-slate">
                      You&apos;ve practiced this topic {topic.attemptsCount} time
                      {topic.attemptsCount === 1 ? "" : "s"}
                      {topic.bestScore !== null && ` · best score ${topic.bestScore}%`}
                    </p>
                  )}

                  <div className="mt-8">
                    {!topic.isAvailable ? (
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
                        Start Practice
                      </button>
                    )}
                  </div>
                </div>
              )}
    </div>
  );
}
