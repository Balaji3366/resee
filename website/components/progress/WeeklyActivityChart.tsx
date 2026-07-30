"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DayActivityPoint } from "@/types/progress";

function formatDate(value: unknown) {
  return new Date(String(value)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function WeeklyActivityChart({ data }: { data: DayActivityPoint[] }) {
  return (
    <div className="rounded-3xl border border-amber/20 bg-panel p-7 shadow-md">
      <h3 className="text-lg font-semibold text-slate">Weekly Activity</h3>

      <div className="mt-4 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="weeklyLearningFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-amber)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--color-amber)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="weeklyPracticeFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-teal)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--color-teal)" stopOpacity={0} />
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
              allowDecimals={false}
              stroke="var(--color-slate)"
              fontSize={12}
              tickLine={false}
              width={32}
            />

            <Tooltip
              labelFormatter={(label) => formatDate(label)}
              contentStyle={{
                background: "var(--color-panel-2)",
                border: "1px solid var(--color-amber)",
                borderRadius: 12,
                color: "var(--color-bone)",
              }}
            />

            <Legend
              formatter={(value) => (
                <span style={{ color: "var(--color-slate)", fontSize: 12 }}>{value}</span>
              )}
            />

            <Area
              type="monotone"
              dataKey="learningEvents"
              name="Learning"
              stroke="var(--color-amber)"
              strokeWidth={2}
              fill="url(#weeklyLearningFill)"
            />

            <Area
              type="monotone"
              dataKey="practiceEvents"
              name="Practice"
              stroke="var(--color-teal)"
              strokeWidth={2}
              fill="url(#weeklyPracticeFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
