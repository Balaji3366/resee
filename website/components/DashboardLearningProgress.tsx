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
    <div className="rounded-[20px] border-2 border-bone bg-panel p-6">
      <p className="text-sm font-bold text-bone/50">Learning Progress</p>

      {loading ? (
        <div className="mt-2 h-6 w-1/2 animate-pulse rounded bg-panel-2" />
      ) : isReady ? (
        <>
          <p className="font-display mt-2 text-2xl font-extrabold text-bone">{subMetric!.score}%</p>

          <div className="mt-3 h-2 rounded-full bg-panel-2">
            <div
              className="h-2 rounded-full bg-amber transition-all duration-700"
              style={{ width: `${subMetric!.score}%` }}
            />
          </div>
        </>
      ) : (
        <>
          <p className="mt-2 text-sm text-bone/60">Not started</p>

          <span className="mt-2 inline-block rounded-full bg-panel-2 px-3 py-1 text-xs font-bold text-slate">
            Coming Soon
          </span>
        </>
      )}
    </div>
  );
}
