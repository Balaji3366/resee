export interface MultiSelectChipOption {
  slug: string;
  label: string;
  icon?: string;
}

export default function MultiSelectChips({
  label,
  options,
  selectedSlugs,
  onToggle,
}: {
  label: string;
  options: MultiSelectChipOption[];
  selectedSlugs: string[];
  onToggle: (slug: string) => void;
}) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-slate">{label}</h3>

      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selectedSlugs.includes(option.slug);

          return (
            <button
              key={option.slug}
              type="button"
              onClick={() => onToggle(option.slug)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                isSelected
                  ? "border-amber bg-amber text-white"
                  : "border-bone/15 bg-panel text-bone hover:border-amber"
              }`}
            >
              {option.icon ? <span>{option.icon}</span> : null}
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
