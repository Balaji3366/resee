import { Plus, X } from "lucide-react";
import StepFooter from "@/components/onboarding/steps/StepFooter";
import { createEmptyCertificationItem } from "@/types/resume-builder";
import type { CertificationItem, ResumeContent } from "@/types/resume-builder";

const inputClass =
  "w-full rounded-lg border border-bone/15 bg-ink px-3 py-2 text-sm text-bone placeholder:text-slate focus:border-amber focus:outline-none";

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-xs font-semibold text-slate">
      {label}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1 ${inputClass}`}
      />
    </label>
  );
}

export default function StepCertifications({
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
  const items = answers.certifications;

  function update(index: number, patch: Partial<CertificationItem>) {
    const next = items.slice();
    next[index] = { ...next[index], ...patch };
    onChange({ certifications: next });
  }

  function remove(index: number) {
    onChange({ certifications: items.filter((_, i) => i !== index) });
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-bone">Certifications</h2>
      <p className="mt-2 text-slate">Add any certifications you&apos;ve earned — optional.</p>

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
            <div className="grid gap-3 pr-6 sm:grid-cols-3">
              <Field label="Name" value={item.name} onChange={(v) => update(i, { name: v })} />
              <Field label="Issuer" value={item.issuer} onChange={(v) => update(i, { issuer: v })} />
              <Field label="Date" value={item.date} onChange={(v) => update(i, { date: v })} />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => onChange({ certifications: [...items, createEmptyCertificationItem()] })}
          className="flex items-center gap-1 text-sm font-semibold text-amber hover:underline"
        >
          <Plus size={14} /> Add Certification
        </button>
      </div>

      <StepFooter onBack={onBack} onNext={onNext} />
    </div>
  );
}
