import type { OnboardingAnswers } from "@/types/onboarding";
import StepFooter from "./StepFooter";

export default function StepTargetCareer({
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
        Your career goal
      </h2>

      <p className="mt-3 text-slate">
        What are you working towards?
      </p>

      <div className="mt-8 space-y-5">
        <div>
          <label className="mb-2 block font-medium text-bone">
            Target Career
          </label>

          <input
            type="text"
            value={answers.targetCareer}
            onChange={(e) => onChange({ targetCareer: e.target.value })}
            placeholder="e.g. AI Engineer, Product Manager"
            className="flex h-14 w-full items-center rounded-xl border border-bone/15 px-4 text-bone placeholder:text-slate outline-none transition focus:border-amber"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium text-bone">
            Dream Company{" "}
            <span className="font-normal text-slate">(optional)</span>
          </label>

          <input
            type="text"
            value={answers.dreamCompany}
            onChange={(e) => onChange({ dreamCompany: e.target.value })}
            placeholder="e.g. Google, Amazon"
            className="flex h-14 w-full items-center rounded-xl border border-bone/15 px-4 text-bone placeholder:text-slate outline-none transition focus:border-amber"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium text-bone">
            Dream Salary{" "}
            <span className="font-normal text-slate">(optional)</span>
          </label>

          <input
            type="text"
            value={answers.dreamSalary}
            onChange={(e) => onChange({ dreamSalary: e.target.value })}
            placeholder="e.g. 12 LPA, $80k/year"
            className="flex h-14 w-full items-center rounded-xl border border-bone/15 px-4 text-bone placeholder:text-slate outline-none transition focus:border-amber"
          />
        </div>
      </div>

      <StepFooter
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!answers.targetCareer.trim()}
      />
    </div>
  );
}
