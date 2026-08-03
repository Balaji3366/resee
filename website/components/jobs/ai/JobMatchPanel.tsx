"use client";

import { Sparkles } from "lucide-react";
import Badge from "@/components/ui/Badge";
import AIDisclosureBadge from "@/components/ai/AIDisclosureBadge";
import AILoadingState from "@/components/ai/AILoadingState";
import AIErrorState from "@/components/ai/AIErrorState";
import { useAIFeature } from "@/hooks/useAIFeature";
import { useFeatureFlag } from "@/components/providers/FeatureFlagsProvider";
import { getJobMatchLabel } from "@/lib/jobMatchLabel";
import type { JobMatchResult } from "@/lib/ai/prompts/jobMatch";

/**
 * Detail-page-only by design (Decision 11) — never mounted on JobCard or
 * any listing view, so a score never discourages a click before the
 * user has read the actual posting.
 */
export default function JobMatchPanel({ jobSlug }: { jobSlug: string }) {
  const enabled = useFeatureFlag("aiJobMatch");
  const { data, error, loading, execute } = useAIFeature<undefined, JobMatchResult>(
    `/api/jobs/${jobSlug}/match`
  );

  if (!enabled) return null;

  return (
    <div className="mt-6 rounded-2xl border border-amber/20 bg-panel p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-display text-sm font-bold text-bone">
          <Sparkles size={16} className="text-amber" />
          AI Job Match
        </h3>
        {data && <AIDisclosureBadge />}
      </div>

      {!data && !loading && !error && (
        <div className="mt-4">
          <p className="text-sm text-slate">See how well your profile fits this role.</p>
          <button
            onClick={() => execute(undefined)}
            className="mt-4 rounded-xl bg-amber px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-dim"
          >
            Check My Match
          </button>
        </div>
      )}

      {loading && <AILoadingState message="Checking your match…" className="mt-4" />}

      {error && <AIErrorState error={error} onRetry={() => execute(undefined)} className="mt-4" />}

      {data && !loading && (
        <div className="mt-5 space-y-4">
          <Badge variant={getJobMatchLabel(data.matchScore).variant}>
            {getJobMatchLabel(data.matchScore).label}
          </Badge>

          <p className="text-sm text-slate">{data.summary}</p>

          {data.matchingSkills.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate">
                Skills You Bring
              </p>
              <div className="flex flex-wrap gap-2">
                {data.matchingSkills.map((s) => (
                  <Badge key={s} variant="success">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {data.missingSkills.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate">
                Room to Grow
              </p>
              <div className="flex flex-wrap gap-2">
                {data.missingSkills.map((s) => (
                  <Badge key={s} variant="neutral">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
