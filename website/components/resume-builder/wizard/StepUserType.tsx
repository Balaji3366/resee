import SelectableCard from "@/components/onboarding/SelectableCard";
import StepFooter from "@/components/onboarding/steps/StepFooter";
import type { ResumeContent, ResumeUserType } from "@/types/resume-builder";

const OPTIONS: { value: ResumeUserType; label: string; icon: string; description: string }[] = [
  {
    value: "fresher",
    label: "Fresher",
    icon: "🌱",
    description: "Recently graduated or looking for my first job",
  },
  {
    value: "experienced",
    label: "Experienced Professional",
    icon: "💼",
    description: "Already working, building on my career",
  },
];

export default function StepUserType({
  answers,
  onChange,
  onNext,
}: {
  answers: ResumeContent;
  onChange: (patch: Partial<ResumeContent>) => void;
  onNext: () => void;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-bone">Who are you?</h2>
      <p className="mt-2 text-slate">This helps ReSee pick the right resume style for you.</p>

      <div className="mt-6 space-y-4">
        {OPTIONS.map((option) => (
          <SelectableCard
            key={option.value}
            icon={option.icon}
            label={option.label}
            description={option.description}
            selected={answers.userType === option.value}
            onClick={() => onChange({ userType: option.value })}
          />
        ))}
      </div>

      <StepFooter onNext={onNext} />
    </div>
  );
}
