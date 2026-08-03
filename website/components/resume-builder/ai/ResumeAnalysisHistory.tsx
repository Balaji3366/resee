"use client";

import { useState } from "react";
import { History, ChevronDown, ChevronUp } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { useResumeAnalyses } from "@/hooks/useResumeAnalyses";
import type { ResumeAnalysisResult } from "@/lib/ai/prompts/resumeAnalysis";

const FEATURE_LABELS: Record<string, string> = {
  resume_analysis: "Analysis",
  resume_rewrite: "Rewrite",
  resume_bullet_improvement: "Bullet Improvement",
  resume_version_comparison: "Version Comparison",
};

export default function ResumeAnalysisHistory({ resumeId }: { resumeId: string }) {
  const { data, loading } = useResumeAnalyses(resumeId);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) return null;
  if (!data || data.length === 0) return null;

  return (
    <div className="rounded-2xl border border-bone/10 bg-panel p-6">
      <h3 className="flex items-center gap-2 font-display text-sm font-bold text-bone">
        <History size={16} />
        AI Analysis History
      </h3>

      <div className="mt-4 space-y-2">
        {data.map((entry) => {
          const isOpen = expandedId === entry.id;
          const scoreLabel =
            entry.feature === "resume_analysis"
              ? `${(entry.result as ResumeAnalysisResult).atsScore}/100`
              : null;

          return (
            <div key={entry.id} className="rounded-xl border border-bone/10 bg-ink">
              <button
                onClick={() => setExpandedId(isOpen ? null : entry.id)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="amber">{FEATURE_LABELS[entry.feature] ?? entry.feature}</Badge>
                  <span className="text-xs text-slate">
                    {new Date(entry.createdAt).toLocaleString()}
                  </span>
                  {scoreLabel && (
                    <span className="text-xs font-semibold text-bone">{scoreLabel}</span>
                  )}
                </div>
                {isOpen ? (
                  <ChevronUp size={16} className="text-slate" />
                ) : (
                  <ChevronDown size={16} className="text-slate" />
                )}
              </button>

              {isOpen && (
                <pre className="overflow-x-auto border-t border-bone/10 px-4 py-3 text-xs text-slate">
                  {JSON.stringify(entry.result, null, 2)}
                </pre>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
