"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import AIDisclosureBadge from "@/components/ai/AIDisclosureBadge";
import AILoadingState from "@/components/ai/AILoadingState";
import AIErrorState from "@/components/ai/AIErrorState";
import { useAIFeature } from "@/hooks/useAIFeature";
import { useFeatureFlag } from "@/components/providers/FeatureFlagsProvider";
import { applyResumeRewrite, applyBulletImprovement } from "@/lib/resumeRewriteMerge";
import type { ResumeRewriteResult } from "@/lib/ai/prompts/resumeRewrite";
import type { ResumeBulletImprovementResult } from "@/lib/ai/prompts/resumeBulletImprovement";
import type { ResumeContent } from "@/types/resume-builder";

async function saveResumeContent(resumeId: string, content: ResumeContent) {
  const res = await fetch(`/api/resumes/${resumeId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Failed to save resume.");
}

function BulletImprovementRow({
  resumeId,
  content,
  experienceId,
  onApplied,
}: {
  resumeId: string;
  content: ResumeContent;
  experienceId: string;
  onApplied: () => void;
}) {
  const { data, error, loading, execute } = useAIFeature<
    { experienceId: string },
    ResumeBulletImprovementResult
  >(`/api/resumes/${resumeId}/bullet-improvement`);
  const [applying, setApplying] = useState(false);

  const experienceItem = content.experience.find((item) => item.id === experienceId);
  if (!experienceItem) return null;

  async function handleApply() {
    if (!data) return;
    setApplying(true);
    try {
      const merged = applyBulletImprovement(content, experienceId, data.improvedBullets);
      await saveResumeContent(resumeId, merged);
      onApplied();
    } finally {
      setApplying(false);
    }
  }

  return (
    <div className="rounded-xl border border-bone/10 bg-ink p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-bone">
          {experienceItem.role} · {experienceItem.company}
        </p>
        {!data && !loading && (
          <button
            onClick={() => execute({ experienceId })}
            className="rounded-lg border border-amber/30 px-3 py-1.5 text-xs font-semibold text-amber hover:bg-amber/10"
          >
            Improve These Bullets
          </button>
        )}
      </div>

      {loading && <AILoadingState message="Improving bullets…" className="mt-3" />}
      {error && (
        <AIErrorState error={error} onRetry={() => execute({ experienceId })} className="mt-3" />
      )}

      {data && (
        <div className="mt-3 space-y-2">
          <ul className="space-y-1 text-sm text-slate">
            {data.improvedBullets.map((bullet, i) => (
              <li key={i}>• {bullet}</li>
            ))}
          </ul>
          {data.achievementSuggestions.length > 0 && (
            <div className="text-xs text-amber-dim">
              {data.achievementSuggestions.map((s, i) => (
                <p key={i}>Idea: {s}</p>
              ))}
            </div>
          )}
          <button
            onClick={handleApply}
            disabled={applying}
            className="rounded-lg bg-amber px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-dim disabled:opacity-50"
          >
            {applying ? "Applying…" : "Apply These Bullets"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function ResumeRewritePanel({
  resumeId,
  content,
  onApplied,
}: {
  resumeId: string;
  content: ResumeContent;
  onApplied: () => void;
}) {
  const enabled = useFeatureFlag("aiResumeRewrite");
  const { data, error, loading, execute } = useAIFeature<
    { targetRole?: string },
    ResumeRewriteResult
  >(`/api/resumes/${resumeId}/rewrite`);
  const [applying, setApplying] = useState(false);

  if (!enabled) return null;

  async function handleApply() {
    if (!data) return;
    setApplying(true);
    try {
      const merged = applyResumeRewrite(content, data);
      await saveResumeContent(resumeId, merged);
      onApplied();
    } finally {
      setApplying(false);
    }
  }

  return (
    <div className="rounded-2xl border border-amber/20 bg-panel p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-display text-sm font-bold text-bone">
          <Sparkles size={16} className="text-amber" />
          AI Resume Rewrite
        </h3>
        {data && <AIDisclosureBadge />}
      </div>

      {!data && !loading && !error && (
        <div className="mt-4">
          <p className="text-sm text-slate">
            Get an improved professional summary, sharper skills list, and stronger bullet points —
            reviewed before anything is applied to your resume.
          </p>
          <button
            onClick={() => execute({})}
            className="mt-4 rounded-xl bg-amber px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-dim"
          >
            Improve My Resume
          </button>
        </div>
      )}

      {loading && <AILoadingState message="Rewriting your resume…" className="mt-4" />}

      {error && <AIErrorState error={error} onRetry={() => execute({})} className="mt-4" />}

      {data && !loading && (
        <div className="mt-5 space-y-5">
          <p className="rounded-xl border-2 border-dashed border-amber/30 bg-ink/50 px-4 py-2 text-xs text-slate">
            Nothing has been applied yet. Review below, then apply if you&apos;re happy with it.
          </p>

          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate">
              Professional Summary
            </p>
            <p className="text-sm text-bone">{data.summary}</p>
          </div>

          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate">Skills</p>
            <p className="text-sm text-bone">{data.skills.join(", ")}</p>
          </div>

          {data.achievementSuggestions.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate">
                Achievement Ideas
              </p>
              <ul className="space-y-1 text-sm text-amber-dim">
                {data.achievementSuggestions.map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={handleApply}
            disabled={applying}
            className="rounded-xl bg-amber px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-dim disabled:opacity-50"
          >
            {applying ? "Applying…" : "Apply to My Resume"}
          </button>
        </div>
      )}

      {content.experience.length > 0 && (
        <div className="mt-6 space-y-3 border-t border-bone/10 pt-5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate">
            Or improve one role at a time
          </p>
          {content.experience.map((item) => (
            <BulletImprovementRow
              key={item.id}
              resumeId={resumeId}
              content={content}
              experienceId={item.id}
              onApplied={onApplied}
            />
          ))}
        </div>
      )}
    </div>
  );
}
