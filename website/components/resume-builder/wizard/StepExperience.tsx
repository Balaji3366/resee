import { Plus, X } from "lucide-react";
import StepFooter from "@/components/onboarding/steps/StepFooter";
import { createEmptyExperienceItem } from "@/types/resume-builder";
import type { ExperienceItem, ResumeContent } from "@/types/resume-builder";

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

export default function StepExperience({
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
  const items = answers.experience;

  function update(index: number, patch: Partial<ExperienceItem>) {
    const next = items.slice();
    next[index] = { ...next[index], ...patch };
    onChange({ experience: next });
  }

  function remove(index: number) {
    onChange({ experience: items.filter((_, i) => i !== index) });
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-bone">Experience</h2>
      <p className="mt-2 text-slate">
        Add your work history — skip this if you&apos;re a fresher with no experience yet.
      </p>

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
              <Field label="Role" value={item.role} onChange={(v) => update(i, { role: v })} />
              <Field label="Company" value={item.company} onChange={(v) => update(i, { company: v })} />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Start"
                  value={item.startDate}
                  onChange={(v) => update(i, { startDate: v })}
                  placeholder="Jan 2022"
                />
                <Field
                  label="End"
                  value={item.endDate}
                  onChange={(v) => update(i, { endDate: v })}
                  placeholder="Present"
                />
              </div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate">
                <input
                  type="checkbox"
                  checked={item.current}
                  onChange={(e) => update(i, { current: e.target.checked })}
                />
                Currently working here
              </label>
              <div className="sm:col-span-2">
                <span className="text-xs font-semibold text-slate">Bullet Points</span>
                <div className="mt-1 space-y-2">
                  {item.bullets.map((bullet, bi) => (
                    <div key={bi} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) => {
                          const bullets = [...item.bullets];
                          bullets[bi] = e.target.value;
                          update(i, { bullets });
                        }}
                        className={inputClass}
                        placeholder="Describe an accomplishment..."
                      />
                      <button
                        type="button"
                        onClick={() => update(i, { bullets: item.bullets.filter((_, idx) => idx !== bi) })}
                        className="shrink-0 text-slate hover:text-red-500"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => update(i, { bullets: [...item.bullets, ""] })}
                    className="flex items-center gap-1 text-sm font-semibold text-amber hover:underline"
                  >
                    <Plus size={14} /> Add Bullet
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => onChange({ experience: [...items, createEmptyExperienceItem()] })}
          className="flex items-center gap-1 text-sm font-semibold text-amber hover:underline"
        >
          <Plus size={14} /> Add Experience
        </button>
      </div>

      <StepFooter onBack={onBack} onNext={onNext} />
    </div>
  );
}
