"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TopicAccuracy } from "@/types/practice";

export default function PracticeTopicAccuracyChart({
  title,
  topics,
  barColor,
  emptyMessage,
}: {
  title: string;
  topics: TopicAccuracy[];
  barColor: string;
  emptyMessage: string;
}) {
  return (
    <div className="rounded-3xl border border-amber/20 bg-panel p-7 shadow-md">
      <h3 className="text-lg font-semibold text-slate">{title}</h3>

      {topics.length === 0 ? (
        <div className="mt-4 flex h-48 items-center justify-center rounded-2xl border border-dashed border-bone/15 bg-panel-2 text-center text-sm text-slate">
          {emptyMessage}
        </div>
      ) : (
        <div className="mt-4 h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topics} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-panel-2)" horizontal={false} />

              <XAxis
                type="number"
                domain={[0, 100]}
                stroke="var(--color-slate)"
                fontSize={12}
                tickLine={false}
              />

              <YAxis
                type="category"
                dataKey="topicTitle"
                stroke="var(--color-slate)"
                fontSize={12}
                tickLine={false}
                width={140}
              />

              <Tooltip
                formatter={(value) => [`${value}%`, "Accuracy"]}
                contentStyle={{
                  background: "var(--color-panel-2)",
                  border: "1px solid var(--color-amber)",
                  borderRadius: 12,
                  color: "var(--color-bone)",
                }}
              />

              <Bar dataKey="accuracyPercent" fill={barColor} radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
