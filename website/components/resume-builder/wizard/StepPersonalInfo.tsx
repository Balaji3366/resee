import StepFooter from "@/components/onboarding/steps/StepFooter";
import type { ResumeContent } from "@/types/resume-builder";

const inputClass =
  "w-full rounded-lg border border-bone/15 bg-ink px-3 py-2 text-sm text-bone placeholder:text-slate focus:border-amber focus:outline-none";

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block text-xs font-semibold text-slate">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`mt-1 ${inputClass}`}
      />
    </label>
  );
}

export default function StepPersonalInfo({
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
  const info = answers.personalInfo;

  function updateInfo(patch: Partial<ResumeContent["personalInfo"]>) {
    onChange({ personalInfo: { ...info, ...patch } });
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-bone">Personal Information</h2>
      <p className="mt-2 text-slate">How should employers reach you?</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Full Name" value={info.fullName} onChange={(v) => updateInfo({ fullName: v })} />
        <Field
          label="Email"
          type="email"
          value={info.email}
          onChange={(v) => updateInfo({ email: v })}
        />
        <Field label="Phone" value={info.phone} onChange={(v) => updateInfo({ phone: v })} />
        <Field
          label="Address (Optional)"
          value={info.address ?? ""}
          onChange={(v) => updateInfo({ address: v })}
        />
        <Field
          label="LinkedIn"
          value={info.linkedin}
          onChange={(v) => updateInfo({ linkedin: v })}
          placeholder="https://linkedin.com/in/you"
        />
        <Field
          label="GitHub"
          value={info.github}
          onChange={(v) => updateInfo({ github: v })}
          placeholder="https://github.com/you"
        />
        <Field
          label="Portfolio"
          value={info.portfolio}
          onChange={(v) => updateInfo({ portfolio: v })}
          placeholder="https://yourname.dev"
        />
      </div>

      <StepFooter onBack={onBack} onNext={onNext} nextDisabled={!info.fullName || !info.email} />
    </div>
  );
}
