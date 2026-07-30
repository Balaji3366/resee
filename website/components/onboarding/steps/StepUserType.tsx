import { USER_TYPES } from "@/constants/onboarding";
import type { OnboardingAnswers } from "@/types/onboarding";
import SelectableCard from "@/components/onboarding/SelectableCard";
import StepFooter from "./StepFooter";

export default function StepUserType({
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
        Who are you?
      </h2>

      <p className="mt-3 text-slate">
        This helps RESEE personalize your entire career journey.
      </p>

      <div className="mt-8 space-y-4">
        {USER_TYPES.map((type) => (
          <SelectableCard
            key={type.value}
            icon={type.icon}
            label={type.label}
            description={type.description}
            selected={answers.userType === type.value}
            onClick={() => onChange({ userType: type.value })}
          />
        ))}
      </div>

      <StepFooter
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!answers.userType}
      />
    </div>
  );
}
