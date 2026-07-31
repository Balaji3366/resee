import TagInput from "@/components/onboarding/steps/TagInput";
import StepFooter from "@/components/onboarding/steps/StepFooter";
import type { ResumeContent } from "@/types/resume-builder";

export default function StepSkills({
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
  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-bone">Skills</h2>
      <p className="mt-2 text-slate">Add your key skills, one at a time.</p>

      <div className="mt-6">
        <TagInput
          values={answers.skills}
          onChange={(skills) => onChange({ skills })}
          suggestions={[]}
          placeholder="Type a skill and press Enter..."
        />
      </div>

      <StepFooter onBack={onBack} onNext={onNext} />
    </div>
  );
}
