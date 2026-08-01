"use client";

import Link from "next/link";
import { FileText, Code2, Mic, BookOpen, FolderKanban, Briefcase } from "lucide-react";
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

// Alternates the mockup's violet/coral tinted sub-metric cards.
const TINT_CLASSES = ["bg-amber-dim/[0.06]", "bg-amber/[0.06]"];

interface DashboardCareerScoreProps {
  data: CareerScoreData | null;
  loading: boolean;
  error: string | null;
}

export default function DashboardCareerScore({ data, loading, error }: DashboardCareerScoreProps) {
  return (
    <section className="mt-12">
      <h2 className="font-display mb-6 text-2xl font-extrabold text-bone">Career Health Score</h2>

      {loading && (
        <div className="rounded-3xl border-2 border-bone bg-panel p-8 text-center text-bone/60">
          Loading your career health score...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-3xl border-2 border-bone bg-panel p-8 text-center text-bone/60">
          Couldn&apos;t load your career health score. Try refreshing the page.
        </div>
      )}

      {!loading && !error && data && (
        <div className="rounded-3xl border-2 border-bone bg-panel p-8">
          <div className="grid gap-10 lg:grid-cols-[200px_1fr]">
            <CareerScoreGauge score={data.overall} status={data.overallStatus} />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {SUB_METRICS.map(({ key, label, icon: Icon }, index) => {
                const metric = data.subMetrics[key];
                const isReady = metric.status === "ready" && metric.score !== null;
                const tint = TINT_CLASSES[index % TINT_CLASSES.length];

                return (
                  <div
                    key={key}
                    className={
                      isReady
                        ? `rounded-2xl ${tint} p-4`
                        : "rounded-2xl border-2 border-dashed border-bone/15 p-4"
                    }
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-bone/70" />
                      <span className="text-sm font-bold text-bone">{label}</span>
                    </div>

                    {isReady ? (
                      <>
                        <p className="font-display mt-2 text-xl font-extrabold text-bone">
                          {metric.score}%
                        </p>

                        <div className="mt-2 h-1.5 rounded-full bg-bone/10">
                          <div
                            className={`h-1.5 rounded-full ${scoreBarColor(
                              metric.score as number
                            )} transition-all duration-700`}
                            style={{ width: `${metric.score}%` }}
                          />
                        </div>
                      </>
                    ) : metric.cta ? (
                      <>
                        <p className="mt-2 text-xs text-bone/45">Not started</p>

                        <Link
                          href={metric.cta.href}
                          className="mt-2 inline-block text-sm font-bold text-amber hover:underline"
                        >
                          {metric.cta.label} →
                        </Link>
                      </>
                    ) : (
                      <p className="mt-2 text-xs text-bone/45">Not started</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-10">
            <h3 className="mb-4 text-sm font-bold text-bone/60">Score History</h3>

            <CareerScoreTimeline history={data.history} />
          </div>
        </div>
      )}
    </section>
  );
}
