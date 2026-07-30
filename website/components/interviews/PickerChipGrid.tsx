export interface PickerChipOption {
  slug: string;
  label: string;
  icon?: string;
  available: boolean;
}

export default function PickerChipGrid({
  label,
  options,
  selectedSlug,
  onSelect,
}: {
  label: string;
  options: PickerChipOption[];
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
}) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-slate">{label}</h3>

      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = option.slug === selectedSlug;

          return (
            <button
              key={option.slug}
              type="button"
              disabled={!option.available}
              onClick={() => onSelect(option.slug)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                isSelected
                  ? "border-amber bg-amber text-white"
                  : option.available
                    ? "border-bone/15 bg-panel text-bone hover:border-amber"
                    : "cursor-not-allowed border-dashed border-bone/15 bg-panel text-slate"
              }`}
            >
              {option.icon ? <span>{option.icon}</span> : null}
              {option.label}
              {!option.available && (
                <span className="rounded-full bg-panel-2 px-2 py-0.5 text-[10px] font-bold text-slate">
                  Soon
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
