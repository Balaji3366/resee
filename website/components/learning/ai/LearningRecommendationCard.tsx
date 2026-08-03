"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import AIDisclosureBadge from "@/components/ai/AIDisclosureBadge";
import { useFeatureFlag } from "@/components/providers/FeatureFlagsProvider";
import type { RuleBasedLearningRecommendation } from "@/lib/learningRecommendation";
import type { LearningRecommendationResult } from "@/lib/ai/prompts/learningRecommendation";

/**
 * Two-layer by design (Decision 10): the rule-based recommendation loads
 * automatically and for free; the AI-enhanced version is only generated
 * on explicit request (it costs a credit) and, per Decision 10, any AI
 * failure is invisible here — this component never renders an AI error
 * state, it simply keeps showing the rule-based card.
 */
export default function LearningRecommendationCard() {
  const aiEnabled = useFeatureFlag("aiLearningRecommendation");
  const [ruleBased, setRuleBased] = useState<RuleBasedLearningRecommendation | null>(null);
  const [ai, setAi] = useState<LearningRecommendationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/learning/recommendation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ useAi: false }),
        });
        const json = await res.json();
        if (!cancelled && json.success) setRuleBased(json.ruleBased);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function getAiRecommendation() {
    setAiLoading(true);
    try {
      const res = await fetch("/api/learning/recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ useAi: true }),
      });
      const json = await res.json();
      if (json.success && json.ai) setAi(json.ai);
      // Any failure silently keeps showing the rule-based card — no error UI.
    } finally {
      setAiLoading(false);
    }
  }

  if (loading) {
    return <div className="mb-6 h-24 animate-pulse rounded-3xl border border-amber/20 bg-panel" />;
  }

  if (!ruleBased) return null;

  const courseSlug = ai?.recommendedCourseSlug ?? ruleBased.courseSlug;
  const reason = ai?.reason ?? ruleBased.reason;

  return (
    <div className="mb-6 rounded-3xl border border-amber/20 bg-panel p-6 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate">
          <Sparkles size={18} className="text-amber" />
          Recommended For You
        </h2>
        {ai && <AIDisclosureBadge />}
      </div>

      <p className="mt-2 text-sm text-bone">{reason}</p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link
          href={`/learning/${courseSlug}`}
          className="rounded-xl bg-amber px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-dim"
        >
          View Course
        </Link>

        {aiEnabled && !ai && (
          <button
            onClick={getAiRecommendation}
            disabled={aiLoading}
            className="rounded-xl border border-amber/30 px-5 py-2.5 text-sm font-semibold text-amber hover:bg-amber/10 disabled:opacity-50"
          >
            {aiLoading ? "Personalizing…" : "Get AI Personalized Recommendation"}
          </button>
        )}
      </div>
    </div>
  );
}
