import { TrendingUp } from "lucide-react";
import type { SubMetric } from "@/lib/careerScore";

export default function DashboardLearningProgress({
  subMetric,
  loading,
}: {
  subMetric: SubMetric | undefined;
  loading: boolean;
}) {
  const isReady = subMetric?.status === "ready" && subMetric.score !== null;

  return (
    <div className="rounded-3xl border border-amber/20 bg-panel p-7 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-panel-2">
        <TrendingUp size={24} className="text-amber" />
      </div>

      <h3 className="mt-6 text-lg font-semibold text-slate">
        Learning Progress
      </h3>

      {loading ? (
        <div className="mt-3 h-6 w-1/2 animate-pulse rounded bg-panel-2" />
      ) : isReady ? (
        <>
          <p className="mt-1 text-2xl font-bold text-bone">
            {subMetric!.score}%
          </p>

          <div className="mt-3 h-2 rounded-full bg-panel-2">
            <div
              className="h-2 rounded-full bg-amber transition-all duration-700"
              style={{ width: `${subMetric!.score}%` }}
            />
          </div>
        </>
      ) : (
        <>
          <p className="mt-1 text-sm text-slate">Not started</p>

          <span className="mt-3 inline-block rounded-full bg-panel-2 px-3 py-1 text-xs font-bold text-slate">
            Coming Soon
          </span>
        </>
      )}
    </div>
  );
}
