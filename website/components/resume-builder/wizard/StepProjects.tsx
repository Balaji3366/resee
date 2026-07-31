import { Plus, X } from "lucide-react";
import StepFooter from "@/components/onboarding/steps/StepFooter";
import { createEmptyProjectItem } from "@/types/resume-builder";
import type { ProjectItem, ResumeContent } from "@/types/resume-builder";

const inputClass =
  "w-full rounded-lg border border-bone/15 bg-ink px-3 py-2 text-sm text-bone placeholder:text-slate focus:border-amber focus:outline-none";

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block text-xs font-semibold text-slate">
      {label}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`mt-1 ${inputClass}`}
      />
    </label>
  );
}

export default function StepProjects({
  answers,
  onChange,
  onNext,
  onBack,
}: {
  answers: ResumeContent;
  onChange: (patch: Partial<ResumeContent>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const items = answers.projects;

  function update(index: number, patch: Partial<ProjectItem>) {
    const next = items.slice();
    next[index] = { ...next[index], ...patch };
    onChange({ projects: next });
  }

  function remove(index: number) {
    onChange({ projects: items.filter((_, i) => i !== index) });
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-bone">Projects</h2>
      <p className="mt-2 text-slate">Showcase things you&apos;ve built.</p>

      <div className="mt-6 space-y-4">
        {items.map((item, i) => (
          <div key={item.id} className="relative rounded-xl border border-bone/10 bg-panel p-4">
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label="Remove"
              className="absolute right-3 top-3 text-slate hover:text-red-500"
            >
              <X size={16} />
            </button>
            <div className="grid gap-3 pr-6 sm:grid-cols-2">
              <Field label="Name" value={item.name} onChange={(v) => update(i, { name: v })} />
              <Field
                label="Link (Optional)"
                value={item.link ?? ""}
                onChange={(v) => update(i, { link: v })}
              />
              <div className="sm:col-span-2">
                <Field
                  label="Description"
                  value={item.description}
                  onChange={(v) => update(i, { description: v })}
                />
              </div>
              <div className="sm:col-span-2">
                <Field
                  label="Tech Stack (comma-separated)"
                  value={item.techStack.join(", ")}
                  onChange={(v) =>
                    update(i, { techStack: v.split(",").map((s) => s.trim()).filter(Boolean) })
                  }
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => onChange({ projects: [...items, createEmptyProjectItem()] })}
          className="flex items-center gap-1 text-sm font-semibold text-amber hover:underline"
        >
          <Plus size={14} /> Add Project
        </button>
      </div>

      <StepFooter onBack={onBack} onNext={onNext} />
    </div>
  );
}
