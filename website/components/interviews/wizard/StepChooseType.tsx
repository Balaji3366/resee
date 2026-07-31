import PickerChipGrid from "@/components/interviews/PickerChipGrid";
import StepFooter from "@/components/onboarding/steps/StepFooter";
import type { InterviewCategory, InterviewExperienceLevel, InterviewSetSummary } from "@/types/interview";

export default function StepChooseType({
  categories,
  sets,
  roleSlug,
  experienceLevel,
  categorySlug,
  onSelect,
  onNext,
  onBack,
}: {
  categories: InterviewCategory[];
  sets: InterviewSetSummary[];
  roleSlug: string;
  experienceLevel: InterviewExperienceLevel;
  categorySlug: string | null;
  onSelect: (slug: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const options = categories.map((category) => ({
    slug: category.slug,
    label: category.name,
    icon: category.icon,
    available: sets.some(
      (s) =>
        s.role.slug === roleSlug &&
        s.experienceLevel === experienceLevel &&
        s.category.slug === category.slug &&
        s.isAvailable
    ),
  }));

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-bone">Choose Interview Type</h2>
      <p className="mt-2 text-slate">What kind of interview would you like to practice?</p>

      <div className="mt-6">
        <PickerChipGrid label="Interview Type" options={options} selectedSlug={categorySlug} onSelect={onSelect} />
      </div>

      <StepFooter onBack={onBack} onNext={onNext} nextDisabled={!categorySlug} nextLabel="Prepare Interview" />
    </div>
  );
}
