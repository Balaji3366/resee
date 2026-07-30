"use client";

import { use, useEffect, useState } from "react";
import DashboardNavbar from "@/components/DashboardNavbar";
import DashboardSidebar from "@/components/DashboardSidebar";
import PracticeQuestionRunner from "@/components/practice/PracticeQuestionRunner";
import { useMockTest } from "@/hooks/useMockTest";

export default function MockTestDetailPage({
  params,
}: {
  params: Promise<{ testSlug: string }>;
}) {
  const { testSlug } = use(params);

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);

  const { data: test, loading, error, refetch } = useMockTest(testSlug);

  useEffect(() => {
    if (test?.inProgressAttemptId && !sessionActive) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSessionActive(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [test?.inProgressAttemptId]);

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

              {sessionActive ? (
                test && (
                  <PracticeQuestionRunner
                    startEndpoint={`/api/practice/mock-tests/${testSlug}/attempt/start`}
                    attemptsBase="/api/practice/mock-test-attempts"
                    timerVariant="countdown"
                    durationMinutes={test.durationMinutes}
                    onSessionEnd={refetch}
                  />
                )
              ) : (
                <>
                  {loading && (
                    <div className="h-64 animate-pulse rounded-3xl border border-amber/20 bg-panel" />
                  )}

                  {!loading && (error || !test) && (
                    <div className="rounded-3xl border border-amber/20 bg-panel p-8 text-center text-slate shadow-md">
                      Couldn&apos;t find this mock test.
                    </div>
                  )}
                </>
              )}

              {!sessionActive && !loading && test && (
                <div className="rounded-3xl border border-amber/20 bg-panel p-8 shadow-md">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <h1 className="font-display text-3xl font-extrabold text-bone">
                        {test.title}
                      </h1>

                      <p className="mt-2 text-slate">{test.description}</p>
                    </div>

                    {!test.isAvailable && (
                      <span className="shrink-0 rounded-full bg-panel-2 px-3 py-1 text-xs font-bold text-slate">
                        Coming Soon
                      </span>
                    )}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3 text-sm">
                    <span className="rounded-full bg-panel-2 px-4 py-2 capitalize text-slate">
                      {test.difficulty}
                    </span>
                    <span className="rounded-full bg-panel-2 px-4 py-2 text-slate">
                      {test.durationMinutes} min
                    </span>
                    <span className="rounded-full bg-panel-2 px-4 py-2 text-slate">
                      {test.totalQuestions} questions
                    </span>
                  </div>

                  {test.isAvailable && test.bestScore !== null && (
                    <p className="mt-6 text-sm font-semibold text-amber">
                      Best score: {test.bestScore}%
                    </p>
                  )}

                  <div className="mt-8">
                    {!test.isAvailable ? (
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
                        Start Mock Test
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
