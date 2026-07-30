import { CheckCircle2, Circle } from "lucide-react";
import type { MilestoneStatus } from "@/types/progress";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function MilestonesSection({ milestones }: { milestones: MilestoneStatus[] }) {
  return (
    <div className="rounded-3xl border border-amber/20 bg-panel p-7 shadow-md">
      <h2 className="text-lg font-semibold text-slate">Milestones</h2>

      <div className="mt-6 space-y-3">
        {milestones.map((milestone) => (
          <div
            key={milestone.slug}
            className="flex items-center justify-between gap-4 rounded-xl bg-panel-2/40 px-4 py-3"
          >
            <span className="flex items-center gap-3">
              {milestone.achieved ? (
                <CheckCircle2 size={20} className="shrink-0 text-teal" />
              ) : (
                <Circle size={20} className="shrink-0 text-slate" />
              )}

              <span className="font-semibold text-bone">{milestone.title}</span>
            </span>

            {milestone.comingSoon ? (
              <span className="shrink-0 rounded-full bg-panel-2 px-2 py-0.5 text-[10px] font-bold text-slate">
                Soon
              </span>
            ) : milestone.achieved && milestone.achievedAt ? (
              <span className="shrink-0 text-xs font-semibold text-amber">
                {formatDate(milestone.achievedAt)}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
