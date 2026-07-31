import PickerChipGrid from "@/components/interviews/PickerChipGrid";
import StepFooter from "@/components/onboarding/steps/StepFooter";
import type { InterviewExperienceLevel, InterviewSetSummary } from "@/types/interview";

const EXPERIENCE_LEVELS: { value: InterviewExperienceLevel; label: string }[] = [
  { value: "fresher", label: "Fresher" },
  { value: "1-3-years", label: "1–3 Years" },
  { value: "3-5-years", label: "3–5 Years" },
  { value: "5-plus-years", label: "5+ Years" },
];

export default function StepSelectExperience({
  sets,
  roleSlug,
  experienceLevel,
  onSelect,
  onNext,
  onBack,
}: {
  sets: InterviewSetSummary[];
  roleSlug: string;
  experienceLevel: InterviewExperienceLevel | null;
  onSelect: (level: InterviewExperienceLevel) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const options = EXPERIENCE_LEVELS.map((level) => ({
    slug: level.value,
    label: level.label,
    available: sets.some(
      (s) => s.role.slug === roleSlug && s.experienceLevel === level.value && s.isAvailable
    ),
  }));

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-bone">Select Experience</h2>
      <p className="mt-2 text-slate">How many years of experience do you have?</p>

      <div className="mt-6">
        <PickerChipGrid
          label="Experience"
          options={options}
          selectedSlug={experienceLevel}
          onSelect={(slug) => onSelect(slug as InterviewExperienceLevel)}
        />
      </div>

      <StepFooter onBack={onBack} onNext={onNext} nextDisabled={!experienceLevel} />
    </div>
  );
}
