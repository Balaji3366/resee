"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Code2, Mic, BookOpen, FolderKanban, Briefcase, TrendingUp } from "lucide-react";
import type { CareerScoreData } from "@/hooks/useCareerScore";
import type { SubMetricKey } from "@/lib/careerScore";
import CareerScoreGauge from "@/components/CareerScoreGauge";
import CareerScoreTimeline from "@/components/CareerScoreTimeline";

const SUB_METRICS: Array<{
  key: SubMetricKey;
  label: string;
  icon: typeof FileText;
}> = [
  { key: "resumeQuality", label: "Resume Quality", icon: FileText },
  { key: "technicalSkills", label: "Technical Skills", icon: Code2 },
  { key: "interviewReadiness", label: "Interview Readiness", icon: Mic },
  { key: "learningProgress", label: "Learning Progress", icon: BookOpen },
  { key: "projectPortfolio", label: "Project Portfolio", icon: FolderKanban },
  { key: "jobReadiness", label: "Job Readiness", icon: Briefcase },
];

function scoreBarColor(score: number) {
  if (score >= 75) return "bg-green-500";
  if (score >= 50) return "bg-yellow-500";
  return "bg-red-500";
}

interface DashboardCareerScoreProps {
  data: CareerScoreData | null;
  loading: boolean;
  error: string | null;
}

/**
 * Was: a floating icon+heading row ABOVE a separate card, and 6
 * sub-metrics each in their own mini tinted/dashed card (a grid of
 * cards inside a card). Now: one card, heading lives inside it, and
 * sub-metrics are a compact list (icon, label, bar, score in a single
 * row) instead of 6 nested boxes — same 6 metrics, same CTAs, far less
 * "card inside a card." Sits side-by-side with Today's Focus on
 * desktop (see Dashboard.tsx), so this no longer owns its own
 * full-width section/margin — the parent grid handles that.
 *
 * Score History used to always render — for most users that's just
 * CareerScoreTimeline's empty-state panel (history needs 2+ days of
 * data points to show a real chart), which was most of this card's
 * height and the main reason it towered over Today's Focus. It's now
 * collapsed by default behind a plain text toggle and only mounted
 * (not just hidden) when expanded, so it reserves zero height rather
 * than being visually hidden at a fixed size.
 */
export default function DashboardCareerScore({ data, loading, error }: DashboardCareerScoreProps) {
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-bone/10 bg-panel p-6 shadow-sm lg:p-7">
      <div className="mb-4 flex items-center gap-2.5">
        <TrendingUp size={18} className="text-teal-dim" />
        <h2 className="text-lg font-extrabold text-bone">Career Health Score</h2>
      </div>

      {loading && (
        <div className="py-10 text-center text-sm text-bone/60">
          Loading your career health score...
        </div>
      )}

      {!loading && error && (
        <div className="py-10 text-center text-sm text-bone/60">
          Couldn&apos;t load your career health score. Try refreshing the page.
        </div>
      )}

      {!loading && !error && data && (
        <>
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <CareerScoreGauge score={data.overall} status={data.overallStatus} />

            <div className="flex min-w-0 flex-1 flex-col gap-2.5">
              {SUB_METRICS.map(({ key, label, icon: Icon }) => {
                const metric = data.subMetrics[key];
                const isReady = metric.status === "ready" && metric.score !== null;

                return (
                  <div key={key} className="flex items-center gap-3">
                    <Icon size={15} className="shrink-0 text-bone/40" />

                    <span className="w-[132px] shrink-0 truncate text-xs font-semibold text-bone/70">
                      {label}
                    </span>

                    {isReady ? (
                      <>
                        <div className="h-1.5 min-w-0 flex-1 rounded-full bg-bone/10">
                          <div
                            className={`h-1.5 rounded-full ${scoreBarColor(
                              metric.score as number
                            )} transition-all duration-700`}
                            style={{ width: `${metric.score}%` }}
                          />
                        </div>

                        <span className="w-9 shrink-0 text-right text-xs font-bold text-bone">
                          {metric.score}%
                        </span>
                      </>
                    ) : metric.cta ? (
                      <Link
                        href={metric.cta.href}
                        className="text-xs font-bold text-amber hover:underline"
                      >
                        {metric.cta.label} →
                      </Link>
                    ) : (
                      <span className="text-xs text-bone/35">Not started</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 border-t border-bone/10 pt-3">
            <button
              type="button"
              onClick={() => setHistoryOpen((prev) => !prev)}
              aria-expanded={historyOpen}
              className="text-xs font-bold text-amber hover:underline"
            >
              {historyOpen ? "Hide Score History" : "View Score History →"}
            </button>

            {historyOpen && (
              <div className="mt-4">
                <p className="mb-3 text-xs font-bold text-bone/45">Score History</p>

                <CareerScoreTimeline history={data.history} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
