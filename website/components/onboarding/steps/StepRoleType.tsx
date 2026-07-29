import { ROLE_TYPES } from "@/constants/onboarding";
import type { OnboardingAnswers } from "@/types/onboarding";
import StepFooter from "./StepFooter";

export default function StepRoleType({
  answers,
  onChange,
  onNext,
}: {
  answers: OnboardingAnswers;
  onChange: (patch: Partial<OnboardingAnswers>) => void;
  onNext: () => void;
}) {
  return (
    <div>
      <h2 className="font-display text-3xl font-extrabold text-bone">
        Tell us about yourself
      </h2>

      <p className="mt-3 text-slate">
        This helps RESEE personalize your entire career journey.
      </p>

      <div className="mt-8 space-y-4">
        {ROLE_TYPES.map((role) => (
          <button
            key={role.value}
            type="button"
            onClick={() => onChange({ roleType: role.value })}
            className={`w-full rounded-xl border px-6 py-5 text-left transition ${
              answers.roleType === role.value
                ? "border-amber bg-panel"
                : "border-bone/15 hover:border-amber"
            }`}
          >
            <p className="text-lg font-bold text-bone">{role.label}</p>
            <p className="mt-1 text-sm text-slate">{role.description}</p>
          </button>
        ))}
      </div>

      <StepFooter onNext={onNext} nextDisabled={!answers.roleType} />
    </div>
  );
}
