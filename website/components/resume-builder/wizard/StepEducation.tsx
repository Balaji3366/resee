import { Plus, X } from "lucide-react";
import StepFooter from "@/components/onboarding/steps/StepFooter";
import { createEmptyEducationItem } from "@/types/resume-builder";
import type { EducationItem, ResumeContent } from "@/types/resume-builder";

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

export default function StepEducation({
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
  const items = answers.education;

  function update(index: number, patch: Partial<EducationItem>) {
    const next = items.slice();
    next[index] = { ...next[index], ...patch };
    onChange({ education: next });
  }

  function remove(index: number) {
    onChange({ education: items.filter((_, i) => i !== index) });
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-bone">Education</h2>
      <p className="mt-2 text-slate">Add your degrees or schooling — most recent first.</p>

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
              <Field
                label="Institution"
                value={item.institution}
                onChange={(v) => update(i, { institution: v })}
              />
              <Field label="Degree" value={item.degree} onChange={(v) => update(i, { degree: v })} />
              <Field
                label="Field of Study"
                value={item.field}
                onChange={(v) => update(i, { field: v })}
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Start"
                  value={item.startDate}
                  onChange={(v) => update(i, { startDate: v })}
                  placeholder="2020"
                />
                <Field
                  label="End"
                  value={item.endDate}
                  onChange={(v) => update(i, { endDate: v })}
                  placeholder="2024"
                />
              </div>
              <div className="sm:col-span-2">
                <Field
                  label="Description (Optional)"
                  value={item.description ?? ""}
                  onChange={(v) => update(i, { description: v })}
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => onChange({ education: [...items, createEmptyEducationItem()] })}
          className="flex items-center gap-1 text-sm font-semibold text-amber hover:underline"
        >
          <Plus size={14} /> Add Education
        </button>
      </div>

      <StepFooter onBack={onBack} onNext={onNext} />
    </div>
  );
}
