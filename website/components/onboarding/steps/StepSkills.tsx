import { SKILL_SUGGESTIONS } from "@/constants/onboarding";
import type { OnboardingAnswers } from "@/types/onboarding";
import StepFooter from "./StepFooter";
import TagInput from "./TagInput";

export default function StepSkills({
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
        Your current skills
      </h2>

      <p className="mt-3 text-slate">
        Add skills you already have. Press Enter to add, or pick a suggestion.
      </p>

      <div className="mt-8">
        <TagInput
          values={answers.currentSkills}
          onChange={(currentSkills) => onChange({ currentSkills })}
          suggestions={SKILL_SUGGESTIONS}
          placeholder="e.g. Python, React, SQL"
        />
      </div>

      <StepFooter
        onBack={onBack}
        onNext={onNext}
        nextDisabled={answers.currentSkills.length === 0}
      />
    </div>
  );
}
