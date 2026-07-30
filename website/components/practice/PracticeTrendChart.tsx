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
import type { PracticeTrendPoint } from "@/types/practice";

function formatDate(value: unknown) {
  return new Date(String(value)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function PracticeTrendChart({
  title,
  data,
  gradientId,
}: {
  title: string;
  data: PracticeTrendPoint[];
  gradientId: string;
}) {
  return (
    <div className="rounded-3xl border border-amber/20 bg-panel p-7 shadow-md">
      <h3 className="text-lg font-semibold text-slate">{title}</h3>

      {data.length < 2 ? (
        <div className="mt-4 flex h-48 items-center justify-center rounded-2xl border border-dashed border-bone/15 bg-panel-2 text-center text-sm text-slate">
          Your progress builds up as you practice
        </div>
      ) : (
        <div className="mt-4 h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-amber)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-amber)" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-panel-2)" />

              <XAxis
                dataKey="periodStart"
                tickFormatter={formatDate}
                stroke="var(--color-slate)"
                fontSize={12}
                tickLine={false}
              />

              <YAxis stroke="var(--color-slate)" fontSize={12} tickLine={false} width={32} />

              <Tooltip
                labelFormatter={(label) => formatDate(label)}
                formatter={(value, name) => [
                  value,
                  name === "questionsSolved" ? "Questions solved" : "Accuracy",
                ]}
                contentStyle={{
                  background: "var(--color-panel-2)",
                  border: "1px solid var(--color-amber)",
                  borderRadius: 12,
                  color: "var(--color-bone)",
                }}
              />

              <Area
                type="monotone"
                dataKey="questionsSolved"
                stroke="var(--color-amber)"
                strokeWidth={2}
                fill={`url(#${gradientId})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
