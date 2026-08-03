import { TrendingDown, TrendingUp } from "lucide-react";
import type { SkillProgress } from "@/types/progress";

function SkillPill({ skill }: { skill: SkillProgress }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-panel-2/40 px-4 py-3">
      <span className="flex items-center gap-2 font-semibold text-bone">
        <span>{skill.icon}</span>
        {skill.name}
      </span>
      <span className="text-sm font-semibold text-slate">
        {skill.percent > 0 ? `${skill.percent}%` : "Not started"}
      </span>
    </div>
  );
}

export default function StrengthsAndWeaknesses({
  strengths,
  areasToImprove,
}: {
  strengths: SkillProgress[];
  areasToImprove: SkillProgress[];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl border border-amber/20 bg-panel p-7 shadow-md">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate">
          <TrendingUp size={18} className="text-teal" />
          Strengths
        </h2>

        {strengths.length === 0 ? (
          <p className="mt-4 text-sm text-slate">Keep practicing to surface your strengths here.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {strengths.map((skill) => (
              <SkillPill key={skill.id} skill={skill} />
            ))}
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-amber/20 bg-panel p-7 shadow-md">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate">
          <TrendingDown size={18} className="text-amber" />
          Areas to Improve
        </h2>

        {areasToImprove.length === 0 ? (
          <p className="mt-4 text-sm text-slate">Nothing to flag yet — keep going.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {areasToImprove.map((skill) => (
              <SkillPill key={skill.id} skill={skill} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
