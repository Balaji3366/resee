export default function ResumeWizardProgress({ step, total }: { step: number; total: number }) {
  const percent = (step / total) * 100;

  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate">
        <span>
          Step {step} of {total}
        </span>
        <span>{Math.round(percent)}%</span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-panel-2">
        <div
          className="h-full rounded-full bg-amber transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
