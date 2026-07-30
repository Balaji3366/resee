import { FileText } from "lucide-react";
import type { ResumeTemplateSummary } from "@/types/resume-builder";

export default function TemplateCard({
  template,
  onSelect,
}: {
  template: ResumeTemplateSummary;
  onSelect: () => void;
}) {
  return (
    <div className="rounded-3xl border border-amber/20 bg-panel p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div className="flex h-40 items-center justify-center rounded-2xl bg-ink text-amber/40">
        <FileText size={48} />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-bone">{template.name}</h3>
        {!template.isAvailable ? (
          <span className="rounded-full bg-panel-2 px-3 py-1 text-xs font-bold text-slate">
            Coming Soon
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-sm text-slate">{template.description}</p>

      <button
        onClick={onSelect}
        disabled={!template.isAvailable}
        className="mt-4 w-full rounded-xl bg-amber py-2.5 font-semibold text-white transition hover:bg-amber-dim disabled:cursor-not-allowed disabled:bg-panel-2 disabled:text-slate"
      >
        {template.isAvailable ? "Use Template" : "Coming Soon"}
      </button>
    </div>
  );
}
