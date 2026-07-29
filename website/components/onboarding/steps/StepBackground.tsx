import type { OnboardingAnswers } from "@/types/onboarding";
import StepFooter from "./StepFooter";

export default function StepBackground({
  answers,
  onChange,
  onNext,
  onBack,
}: {
  answers: OnboardingAnswers;
  onChange: (patch: Partial<OnboardingAnswers>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div>
      <h2 className="font-display text-3xl font-extrabold text-bone">
        Your background
      </h2>

      <p className="mt-3 text-slate">
        Tell us about your education and experience so far.
      </p>

      <div className="mt-8 space-y-5">
        <div>
          <label className="mb-2 block font-medium text-bone">
            Education
          </label>

          <textarea
            value={answers.education}
            onChange={(e) => onChange({ education: e.target.value })}
            placeholder="e.g. B.Tech in Computer Science, final year"
            rows={3}
            className="w-full rounded-xl border border-bone/15 p-4 text-bone placeholder:text-slate outline-none transition focus:border-amber"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium text-bone">
            Experience
          </label>

          <textarea
            value={answers.experience}
            onChange={(e) => onChange({ experience: e.target.value })}
            placeholder="e.g. 1 year as a frontend intern, or 'No experience yet'"
            rows={3}
            className="w-full rounded-xl border border-bone/15 p-4 text-bone placeholder:text-slate outline-none transition focus:border-amber"
          />
        </div>
      </div>

      <StepFooter
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!answers.education.trim()}
      />
    </div>
  );
}
