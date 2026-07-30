"use client";

export default function PracticeCategoryCard({
  name,
  icon,
  availableCount,
  active,
  onClick,
}: {
  name: string;
  icon: string;
  availableCount: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-3xl border p-6 text-left shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
        active ? "border-amber bg-panel-2/40" : "border-amber/20 bg-panel"
      }`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-panel-2 text-2xl">
        {icon}
      </div>

      <h3 className="mt-4 font-semibold text-bone">{name}</h3>

      <p className="mt-1 text-xs font-semibold text-slate">
        {availableCount > 0 ? `${availableCount} topic${availableCount === 1 ? "" : "s"}` : "Coming Soon"}
      </p>
    </button>
  );
}
