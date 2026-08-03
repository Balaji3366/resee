"use client";

import { Sparkles } from "lucide-react";
import ProgressRing from "@/components/ui/ProgressRing";
import Badge from "@/components/ui/Badge";
import AIDisclosureBadge from "@/components/ai/AIDisclosureBadge";
import AILoadingState from "@/components/ai/AILoadingState";
import AIErrorState from "@/components/ai/AIErrorState";
import { useAIFeature } from "@/hooks/useAIFeature";
import { useFeatureFlag } from "@/components/providers/FeatureFlagsProvider";
import { downloadResumeAnalysisReportPdf } from "@/lib/resume-pdf/analysisReportPdf";
import type { ResumeAnalysisResult } from "@/lib/ai/prompts/resumeAnalysis";

export default function ResumeAnalysisPanel({
  resumeId,
  resumeTitle,
}: {
  resumeId: string;
  resumeTitle: string;
}) {
  const enabled = useFeatureFlag("aiResumeAnalysis");
  const { data, error, loading, execute, reset } = useAIFeature<undefined, ResumeAnalysisResult>(
    `/api/resumes/${resumeId}/analyze`
  );

  if (!enabled) return null;

  return (
    <div className="rounded-2xl border border-amber/20 bg-panel p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-display text-sm font-bold text-bone">
          <Sparkles size={16} className="text-amber" />
          AI Resume Analysis
        </h3>
        {data && <AIDisclosureBadge />}
      </div>

      {!data && !loading && !error && (
        <div className="mt-4">
          <p className="text-sm text-slate">
            Get an ATS score, section-by-section breakdown, keyword analysis, and improvement
            suggestions for this resume.
          </p>
          <button
            onClick={() => execute(undefined)}
            className="mt-4 rounded-xl bg-amber px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-dim"
          >
            Analyze Resume
          </button>
        </div>
      )}

      {loading && <AILoadingState message="Analyzing your resume…" className="mt-4" />}

      {error && <AIErrorState error={error} onRetry={() => execute(undefined)} className="mt-4" />}

      {data && !loading && (
        <div className="mt-5 space-y-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <ProgressRing value={data.atsScore} size={120} strokeWidth={10}>
              <div className="text-center">
                <p className="text-2xl font-bold text-bone">{data.atsScore}</p>
                <p className="text-[10px] uppercase tracking-wide text-slate">ATS Score</p>
              </div>
            </ProgressRing>
            <p className="flex-1 text-sm text-slate">{data.summary}</p>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate">
              Section Scores
            </p>
            <div className="space-y-2">
              {data.sectionScores.map((section) => (
                <div key={section.section} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 text-sm text-bone">{section.section}</span>
                  <div className="h-1.5 flex-1 rounded-full bg-panel-2">
                    <div
                      className="h-1.5 rounded-full bg-amber transition-all duration-700"
                      style={{ width: `${section.score}%` }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-right text-xs text-slate">
                    {section.score}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate">Strengths</p>
              <ul className="space-y-1.5 text-sm text-bone">
                {data.strengths.map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate">
                Weaknesses
              </p>
              <ul className="space-y-1.5 text-sm text-bone">
                {data.weaknesses.map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate">Keywords</p>
            <div className="flex flex-wrap gap-2">
              {data.matchedKeywords.map((k) => (
                <Badge key={k} variant="success">
                  {k}
                </Badge>
              ))}
              {data.missingKeywords.map((k) => (
                <Badge key={k} variant="warning">
                  Missing: {k}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate">Suggestions</p>
            <ul className="space-y-1.5 text-sm text-bone">
              {data.suggestions.map((s, i) => (
                <li key={i}>• {s}</li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-bone/10 pt-4">
            <button
              onClick={() => downloadResumeAnalysisReportPdf(data, resumeTitle)}
              className="rounded-xl border border-bone/15 px-4 py-2 text-sm font-semibold text-bone hover:bg-ink"
            >
              Export Report (PDF)
            </button>
            <button
              onClick={() => {
                reset();
                execute(undefined);
              }}
              className="rounded-xl border border-bone/15 px-4 py-2 text-sm font-semibold text-bone hover:bg-ink"
            >
              Re-analyze
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
