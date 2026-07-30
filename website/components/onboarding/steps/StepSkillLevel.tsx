import { SKILL_LEVELS } from "@/constants/onboarding";
import type { OnboardingAnswers } from "@/types/onboarding";
import SelectableCard from "@/components/onboarding/SelectableCard";
import StepFooter from "./StepFooter";

export default function StepSkillLevel({
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
        Current Skill Level
      </h2>

      <p className="mt-3 text-slate">
        Where are you starting from?
      </p>

      <div className="mt-8 space-y-4">
        {SKILL_LEVELS.map((level) => (
          <SelectableCard
            key={level.value}
            label={level.label}
            description={level.description}
            selected={answers.skillLevel === level.value}
            onClick={() => onChange({ skillLevel: level.value })}
          />
        ))}
      </div>

      <StepFooter
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!answers.skillLevel}
      />
    </div>
  );
}
