"use client";

import Link from "next/link";
import { Sparkles, Target, Map } from "lucide-react";
import Badge from "@/components/ui/Badge";
import AIDisclosureBadge from "@/components/ai/AIDisclosureBadge";
import AILoadingState from "@/components/ai/AILoadingState";
import AIErrorState from "@/components/ai/AIErrorState";
import { useAIFeature } from "@/hooks/useAIFeature";
import { useFeatureFlag } from "@/components/providers/FeatureFlagsProvider";
import { useProfile } from "@/hooks/useProfile";
import type { SkillGapResult } from "@/lib/ai/prompts/skillGap";
import type { RoadmapMilestoneWithMatch } from "@/lib/careerRoadmapCatalogMatch";

function SkillGapSection() {
  const enabled = useFeatureFlag("aiSkillGap");
  const { data, error, loading, execute } = useAIFeature<undefined, SkillGapResult>(
    "/api/progress/skill-gap"
  );

  if (!enabled) return null;

  return (
    <div className="rounded-2xl border border-amber/20 bg-panel p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-display text-sm font-bold text-bone">
          <Target size={16} className="text-amber" />
          AI Skill Gap Analysis
        </h3>
        {data && <AIDisclosureBadge />}
      </div>

      {!data && !loading && !error && (
        <button
          onClick={() => execute(undefined)}
          className="mt-4 rounded-xl bg-amber px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-dim"
        >
          Check Skill Gap
        </button>
      )}

      {loading && <AILoadingState message="Analyzing your skill gap…" className="mt-4" />}
      {error && <AIErrorState error={error} onRetry={() => execute(undefined)} className="mt-4" />}

      {data && !loading && (
        <div className="mt-4 space-y-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate">You Have</p>
            <div className="flex flex-wrap gap-2">
              {data.hasSkills.map((s) => (
                <Badge key={s} variant="success">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate">Missing</p>
            <div className="flex flex-wrap gap-2">
              {data.missingSkills.map((s) => (
                <Badge key={s} variant="neutral">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate">
              Recommendations
            </p>
            <ul className="space-y-1.5 text-sm text-bone">
              {data.recommendations.map((r, i) => (
                <li key={i}>• {r}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function RoadmapSection() {
  const enabled = useFeatureFlag("aiCareerRoadmap");
  const { data, error, loading, execute } = useAIFeature<
    { timeframeMonths?: number },
    { milestones: RoadmapMilestoneWithMatch[] }
  >("/api/progress/roadmap");

  if (!enabled) return null;

  return (
    <div className="rounded-2xl border border-amber/20 bg-panel p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-display text-sm font-bold text-bone">
          <Map size={16} className="text-amber" />
          AI Career Roadmap
        </h3>
        {data && <AIDisclosureBadge />}
      </div>

      {!data && !loading && !error && (
        <button
          onClick={() => execute({})}
          className="mt-4 rounded-xl bg-amber px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-dim"
        >
          Generate Roadmap
        </button>
      )}

      {loading && <AILoadingState message="Designing your roadmap…" className="mt-4" />}
      {error && <AIErrorState error={error} onRetry={() => execute({})} className="mt-4" />}

      {data && !loading && (
        <ol className="mt-4 space-y-4">
          {data.milestones.map((milestone, i) => (
            <li key={i} className="rounded-xl border border-bone/10 bg-ink p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-bone">
                  {i + 1}. {milestone.title}
                </p>
                <span className="text-xs text-slate">~{milestone.estimatedWeeks}w</span>
              </div>
              <p className="mt-1 text-sm text-slate">{milestone.description}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {milestone.suggestedSkills.map((s) => (
                  <Badge key={s} variant="amber">
                    {s}
                  </Badge>
                ))}
              </div>
              <div className="mt-3">
                {milestone.courseMatchStatus === "matched" ? (
                  <Link
                    href={`/learning/${milestone.matchedCourseSlug}`}
                    className="text-xs font-semibold text-amber hover:underline"
                  >
                    Start with: {milestone.matchedCourseTitle} →
                  </Link>
                ) : (
                  <p className="text-xs text-slate">
                    No internal course currently available for this yet.
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default function CareerIntelligencePanel() {
  const { data: profile, loading: profileLoading } = useProfile();
  const skillGapEnabled = useFeatureFlag("aiSkillGap");
  const roadmapEnabled = useFeatureFlag("aiCareerRoadmap");

  if (!skillGapEnabled && !roadmapEnabled) return null;
  if (profileLoading) return null;

  if (!profile?.targetCareer) {
    return (
      <div className="rounded-2xl border border-dashed border-bone/15 bg-panel p-6 text-center">
        <p className="flex items-center justify-center gap-2 text-sm text-slate">
          <Sparkles size={16} />
          Set your target career in Settings to unlock AI Skill Gap Analysis and Career Roadmaps.
        </p>
        <Link
          href="/settings"
          className="mt-3 inline-block text-sm font-semibold text-amber hover:underline"
        >
          Go to Settings →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <SkillGapSection />
      <RoadmapSection />
    </div>
  );
}
