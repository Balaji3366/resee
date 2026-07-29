"use client";

import type { OverallStatus } from "@/lib/careerScore";

interface CareerScoreGaugeProps {
  score: number | null;
  status: OverallStatus;
}

const RADIUS = 70;
const STROKE_WIDTH = 14;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function bandColor(score: number) {
  if (score >= 75) {
    return { stroke: "#22c55e", text: "text-green-400" };
  }

  if (score >= 50) {
    return { stroke: "#eab308", text: "text-yellow-400" };
  }

  return { stroke: "#ef4444", text: "text-red-400" };
}

export default function CareerScoreGauge({
  score,
  status,
}: CareerScoreGaugeProps) {
  const hasScore = score !== null;
  const colors = hasScore ? bandColor(score) : null;
  const progress = hasScore ? Math.min(100, Math.max(0, score)) / 100 : 0;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[180px] w-[180px]">
        <svg
          width="180"
          height="180"
          viewBox="0 0 180 180"
          className="-rotate-90"
        >
          <circle
            cx="90"
            cy="90"
            r={RADIUS}
            fill="none"
            stroke="var(--color-panel-2)"
            strokeWidth={STROKE_WIDTH}
          />

          {hasScore && (
            <circle
              cx="90"
              cy="90"
              r={RADIUS}
              fill="none"
              stroke={colors!.stroke}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              className="transition-[stroke-dashoffset] duration-700 ease-out"
            />
          )}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-display text-5xl font-extrabold ${
              hasScore ? colors!.text : "text-slate"
            }`}
          >
            {hasScore ? score : "—"}
          </span>

          <span className="mt-1 text-sm text-slate">/ 100</span>
        </div>
      </div>

      <div className="mt-4 max-w-[220px] text-center text-sm text-slate">
        {status === "baseline" && "(estimated at onboarding)"}
        {status === "insufficient_data" &&
          "Not enough data yet — complete onboarding or analyze a resume"}
      </div>
    </div>
  );
}
