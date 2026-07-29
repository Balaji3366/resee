export default function StepFooter({
  onBack,
  onNext,
  nextLabel = "Continue",
  nextDisabled = false,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}) {
  return (
    <div className="mt-8 flex items-center gap-4">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-bone/15 px-6 py-4 font-bold text-bone transition hover:border-amber"
        >
          Back
        </button>
      )}

      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="flex-1 rounded-xl bg-amber py-4 text-lg font-bold text-white transition hover:bg-amber-dim disabled:opacity-60"
      >
        {nextLabel}
      </button>
    </div>
  );
}
