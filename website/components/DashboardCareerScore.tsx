"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  Code2,
  Mic,
  BookOpen,
  FolderKanban,
  Briefcase,
} from "lucide-react";
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

export default function DashboardCareerScore({
  data,
  loading,
  error,
}: DashboardCareerScoreProps) {

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mt-12"
    >
      <div className="mb-6 flex items-center gap-3">
        <span className="h-10 w-1 rounded-full bg-amber" />
        <h2 className="font-display text-3xl font-bold text-bone">
          Career Health Score
        </h2>
      </div>

      {loading && (
        <div className="rounded-3xl border border-amber/20 bg-panel p-8 text-center text-slate shadow-md">
          Loading your career health score...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-3xl border border-red-500/20 bg-panel p-8 text-center text-slate shadow-md">
          Couldn&apos;t load your career health score. Try refreshing the page.
        </div>
      )}

      {!loading && !error && data && (
        <div className="rounded-3xl border border-amber/20 bg-panel p-8 shadow-md">
          <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
            <CareerScoreGauge score={data.overall} status={data.overallStatus} />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {SUB_METRICS.map(({ key, label, icon: Icon }) => {
                const metric = data.subMetrics[key];
                const isReady = metric.status === "ready" && metric.score !== null;

                return (
                  <div
                    key={key}
                    className={
                      isReady
                        ? "rounded-2xl border border-amber/20 bg-panel p-5"
                        : "rounded-2xl border border-dashed border-bone/15 bg-panel p-5"
                    }
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-amber" />
                      <span className="text-sm font-semibold text-bone">
                        {label}
                      </span>
                    </div>

                    {isReady ? (
                      <>
                        <p className="mt-3 text-2xl font-bold text-bone">
                          {metric.score}%
                        </p>

                        <div className="mt-2 h-2 rounded-full bg-panel-2">
                          <div
                            className={`h-2 rounded-full ${scoreBarColor(
                              metric.score as number
                            )} transition-all duration-700`}
                            style={{ width: `${metric.score}%` }}
                          />
                        </div>
                      </>
                    ) : metric.cta ? (
                      <>
                        <p className="mt-3 text-sm text-slate">Not started</p>

                        <Link
                          href={metric.cta.href}
                          className="mt-3 inline-block text-sm font-semibold text-amber hover:underline"
                        >
                          {metric.cta.label} →
                        </Link>
                      </>
                    ) : (
                      <>
                        <p className="mt-3 text-sm text-slate">Not started</p>

                        <span className="mt-3 inline-block rounded-full bg-panel-2 px-3 py-1 text-xs font-bold text-slate">
                          Coming Soon
                        </span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-10">
            <h3 className="mb-4 text-sm font-semibold text-slate">
              Score History
            </h3>

            <CareerScoreTimeline history={data.history} />
          </div>
        </div>
      )}
    </motion.section>
  );
}
