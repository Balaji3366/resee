import { GOALS } from "@/constants/goals";
import type { OnboardingAnswers } from "@/types/onboarding";
import SelectableCard from "@/components/onboarding/SelectableCard";
import StepFooter from "./StepFooter";

export default function StepGoal({
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
        What is your goal?
      </h2>

      <p className="mt-3 text-slate">
        Pick the one that matters most right now.
      </p>

      <div className="mt-8 space-y-4">
        {GOALS.map((goal) => (
          <SelectableCard
            key={goal.id}
            icon={goal.icon}
            label={goal.label}
            selected={answers.goal === goal.id}
            onClick={() => onChange({ goal: goal.id })}
          />
        ))}
      </div>

      <StepFooter
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!answers.goal}
      />
    </div>
  );
}
