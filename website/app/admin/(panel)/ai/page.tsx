"use client";

import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Coins,
  Gauge,
  ListTree,
  Sparkles,
  ToggleLeft,
} from "lucide-react";
import PracticeStatTile from "@/components/practice/PracticeStatTile";
import AdminTrendChart from "@/components/admin/AdminTrendChart";
import { useAdminAIStats } from "@/hooks/useAdminAIStats";

export default function AdminAIDashboardPage() {
  const { data: stats, loading } = useAdminAIStats();

  if (loading || !stats) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-3xl border border-amber/20 bg-panel"
            />
          ))}
        </div>
      </div>
    );
  }

  const errorRate =
    stats.totalRequests > 0
      ? Math.round((stats.statusBreakdown.error / stats.totalRequests) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-bone md:text-4xl">
            AI Platform
          </h1>
          <p className="mt-2 text-slate">
            Usage, cost, and reliability across the AI orchestration layer.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin/ai/requests"
            className="flex items-center gap-2 rounded-xl border border-bone/15 px-5 py-3 font-semibold text-bone transition hover:border-amber"
          >
            <ListTree size={18} />
            Request Logs
          </Link>
          <Link
            href="/admin/ai/feature-flags"
            className="flex items-center gap-2 rounded-xl border border-bone/15 px-5 py-3 font-semibold text-bone transition hover:border-amber"
          >
            <ToggleLeft size={18} />
            Feature Flags
          </Link>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <PracticeStatTile
          label="Total AI Requests"
          value={String(stats.totalRequests)}
          icon={Sparkles}
        />
        <PracticeStatTile
          label="Requests Today"
          value={String(stats.requestsToday)}
          icon={Activity}
        />
        <PracticeStatTile label="Error Rate (30d)" value={`${errorRate}%`} icon={AlertTriangle} />
        <PracticeStatTile
          label="Avg Latency"
          value={stats.avgLatencyMs !== null ? `${stats.avgLatencyMs} ms` : "—"}
          icon={Gauge}
        />
      </div>

      <div className="mt-4 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <PracticeStatTile
          label="Total Tokens (30d)"
          value={stats.totalTokens.toLocaleString()}
          icon={Sparkles}
        />
        <PracticeStatTile
          label="Requests This Week"
          value={String(stats.requestsThisWeek)}
          icon={Activity}
        />
        <PracticeStatTile
          label="Credits Granted"
          value={String(stats.creditsGranted)}
          icon={Coins}
        />
        <PracticeStatTile label="Credits Spent" value={String(stats.creditsSpent)} icon={Coins} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <AdminTrendChart
          title="AI Requests (30d)"
          data={stats.requestsTrend}
          gradientId="aiRequestsFill"
        />
        <AdminTrendChart
          title="AI Errors (30d)"
          data={stats.errorTrend}
          gradientId="aiErrorsFill"
        />
      </div>

      <div className="mt-8 rounded-3xl border border-amber/20 bg-panel p-7 shadow-md">
        <h2 className="mb-4 text-lg font-semibold text-slate">Requests by Feature (30d)</h2>

        {stats.requestsByFeature.length === 0 ? (
          <p className="text-sm text-slate">No AI requests logged yet.</p>
        ) : (
          <div className="space-y-3">
            {stats.requestsByFeature.map((f) => (
              <div key={f.feature} className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-bone">{f.feature}</span>
                <span className="text-sm text-slate">{f.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 rounded-3xl border border-amber/20 bg-panel p-7 shadow-md">
        <h2 className="mb-4 text-lg font-semibold text-slate">Users by Plan</h2>

        {stats.usersByPlan.length === 0 ? (
          <p className="text-sm text-slate">
            No subscription rows yet — everyone is on the implicit Free plan.
          </p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {stats.usersByPlan.map((p) => (
              <span
                key={p.plan}
                className="rounded-full bg-panel-2 px-4 py-2 text-sm font-semibold capitalize text-bone"
              >
                {p.plan}: {p.count}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
