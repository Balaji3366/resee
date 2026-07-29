import { STUDY_TIME_OPTIONS, INTEREST_SUGGESTIONS } from "@/constants/onboarding";
import type { OnboardingAnswers } from "@/types/onboarding";
import StepFooter from "./StepFooter";
import TagInput from "./TagInput";

export default function StepPreferences({
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
        Study time & interests
      </h2>

      <p className="mt-3 text-slate">
        This helps us pace your roadmap and suggest relevant content.
      </p>

      <div className="mt-8">
        <label className="mb-2 block font-medium text-bone">
          Available study time
        </label>

        <div className="grid grid-cols-2 gap-3">
          {STUDY_TIME_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onChange({ studyTime: option })}
              className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                answers.studyTime === option
                  ? "border-amber bg-panel text-bone"
                  : "border-bone/15 text-slate hover:border-amber"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <label className="mb-2 block font-medium text-bone">
          Interests
        </label>

        <TagInput
          values={answers.interests}
          onChange={(interests) => onChange({ interests })}
          suggestions={INTEREST_SUGGESTIONS}
          placeholder="e.g. AI, Web Development"
        />
      </div>

      <StepFooter
        onBack={onBack}
        onNext={onNext}
        nextLabel="Finish & Generate My Career Profile"
        nextDisabled={!answers.studyTime}
      />
    </div>
  );
}
