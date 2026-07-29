"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CareerScoreHistoryPoint } from "@/hooks/useCareerScore";

interface CareerScoreTimelineProps {
  history: CareerScoreHistoryPoint[];
}

function formatDate(value: unknown) {
  return new Date(String(value)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function CareerScoreTimeline({
  history,
}: CareerScoreTimelineProps) {
  if (history.length < 2) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-bone/15 bg-panel-2 text-center text-sm text-slate">
        Your score history builds up as your activity changes
      </div>
    );
  }

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={history} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="careerScoreFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-amber)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--color-amber)" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-panel-2)" />

          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke="var(--color-slate)"
            fontSize={12}
            tickLine={false}
          />

          <YAxis
            domain={[0, 100]}
            stroke="var(--color-slate)"
            fontSize={12}
            tickLine={false}
            width={32}
          />

          <Tooltip
            labelFormatter={(label) => formatDate(label)}
            formatter={(value) => [`${value}/100`, "Score"]}
            contentStyle={{
              background: "var(--color-panel-2)",
              border: "1px solid var(--color-amber)",
              borderRadius: 12,
              color: "var(--color-bone)",
            }}
          />

          <Area
            type="monotone"
            dataKey="overall"
            stroke="var(--color-amber)"
            strokeWidth={2}
            fill="url(#careerScoreFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
