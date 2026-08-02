import { Check, Circle } from "lucide-react";
import { computeResumeCompleteness } from "@/lib/resumeCompleteness";
import type { ResumeContent } from "@/types/resume-builder";

export default function ResumeCompletenessCard({ content }: { content: ResumeContent }) {
  const { percent, checks } = computeResumeCompleteness(content);

  return (
    <div className="rounded-2xl border border-bone/10 bg-panel p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-bold text-bone">Resume Completeness</h3>
        <span className="text-sm font-semibold text-bone">{percent}%</span>
      </div>

      <div className="mt-3 h-2 rounded-full bg-panel-2">
        <div
          className="h-2 rounded-full bg-amber transition-all duration-700"
          style={{ width: `${percent}%` }}
        />
      </div>

      <ul className="mt-4 space-y-2 text-sm">
        {checks.map((check) => (
          <li key={check.label} className="flex items-center gap-2">
            {check.met ? (
              <Check size={15} className="shrink-0 text-teal" />
            ) : (
              <Circle size={15} className="shrink-0 text-slate/40" />
            )}
            <span className={check.met ? "text-bone" : "text-slate"}>{check.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
