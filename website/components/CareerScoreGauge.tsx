"use client";

import type { OverallStatus } from "@/lib/careerScore";
import ProgressRing from "@/components/ui/ProgressRing";

interface CareerScoreGaugeProps {
  score: number | null;
  status: OverallStatus;
}

// Semantic score-band colors (good/medium/low) — deliberately kept separate
// from the coral/violet/yellow brand accents, since this signal needs to
// stay legible regardless of palette.
function bandColor(score: number) {
  if (score >= 75) return { stroke: "#22c55e", text: "text-green-500" };
  if (score >= 50) return { stroke: "#eab308", text: "text-yellow-500" };
  return { stroke: "#ef4444", text: "text-red-500" };
}

export default function CareerScoreGauge({ score, status }: CareerScoreGaugeProps) {
  const hasScore = score !== null;
  const colors = hasScore ? bandColor(score) : null;

  return (
    <div className="flex flex-col items-center">
      <ProgressRing
        value={hasScore ? score : 0}
        size={136}
        strokeWidth={10}
        color={hasScore ? colors!.stroke : "transparent"}
      >
        <div className="flex flex-col items-center">
          <span
            className={`font-display text-3xl font-extrabold ${hasScore ? colors!.text : "text-bone/40"}`}
          >
            {hasScore ? score : "—"}
          </span>

          <span className="mt-1 text-xs text-bone/50">/ 100</span>
        </div>
      </ProgressRing>

      {/* Only mounted when there's actual text — for the common
          "computed" status this div previously rendered empty but
          still carried its mt-4, a fixed chunk of dead vertical space
          in every real (non-baseline, non-insufficient-data) render. */}
      {(status === "baseline" || status === "insufficient_data") && (
        <div className="mt-4 max-w-[220px] text-center text-sm text-bone/60">
          {status === "baseline"
            ? "(estimated at onboarding)"
            : "Not enough data yet — complete onboarding or analyze a resume"}
        </div>
      )}
    </div>
  );
}
