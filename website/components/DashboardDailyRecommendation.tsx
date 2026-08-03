"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import AIDisclosureBadge from "@/components/ai/AIDisclosureBadge";
import { useFeatureFlag } from "@/components/providers/FeatureFlagsProvider";
import type { RuleBasedDailyRecommendation } from "@/lib/dailyRecommendation";
import type { DailyRecommendationActionType } from "@/lib/ai/prompts/dailyRecommendation";

const ACTION_LINKS: Record<DailyRecommendationActionType, { href: string; label: string } | null> =
  {
    daily_challenge: { href: "/practice/daily", label: "Start Daily Challenge" },
    continue_learning: { href: "/learning", label: "Continue Learning" },
    practice_weak_topic: { href: "/practice", label: "Go Practice" },
    none: null,
  };

/**
 * Separate from DashboardTodaysMission (an onboarding checklist, a
 * distinct concern) — this is the ongoing daily nudge. Same two-layer
 * pattern as Learning Recommendation: rule-based loads free and
 * automatically, the AI layer is opt-in and any failure is invisible
 * here (no AI error UI, just keeps the rule-based nudge).
 */
export default function DashboardDailyRecommendation() {
  const aiEnabled = useFeatureFlag("aiDailyRecommendation");
  const [ruleBased, setRuleBased] = useState<RuleBasedDailyRecommendation | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [aiAction, setAiAction] = useState<DailyRecommendationActionType | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/dashboard/daily-recommendation", {
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

  async function getAiNudge() {
    setAiLoading(true);
    try {
      const res = await fetch("/api/dashboard/daily-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ useAi: true }),
      });
      const json = await res.json();
      if (json.success && json.ai) {
        setAiMessage(json.ai.message);
        setAiAction(json.ai.suggestedAction);
      }
    } finally {
      setAiLoading(false);
    }
  }

  if (loading || !ruleBased) return null;

  const message = aiMessage ?? ruleBased.message;
  const action = ACTION_LINKS[aiAction ?? ruleBased.suggestedAction];

  return (
    <div className="animate-fade-up mb-7 rounded-3xl border-2 border-bone/10 bg-panel p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-display text-[17px] font-bold text-bone">
          <Sparkles size={16} className="text-amber" />
          Today&apos;s Nudge
        </h3>
        {aiMessage && <AIDisclosureBadge />}
      </div>

      <p className="mt-3 text-sm text-bone/80">{message}</p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {action && (
          <Link
            href={action.href}
            className="rounded-xl bg-amber px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-dim"
          >
            {action.label}
          </Link>
        )}

        {aiEnabled && !aiMessage && (
          <button
            onClick={getAiNudge}
            disabled={aiLoading}
            className="rounded-xl border border-amber/30 px-4 py-2 text-xs font-semibold text-amber hover:bg-amber/10 disabled:opacity-50"
          >
            {aiLoading ? "Personalizing…" : "Personalize with AI"}
          </button>
        )}
      </div>
    </div>
  );
}
