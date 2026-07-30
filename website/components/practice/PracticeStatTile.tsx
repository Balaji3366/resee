import type { LucideIcon } from "lucide-react";

export default function PracticeStatTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-3xl border border-amber/20 bg-panel p-6 shadow-md">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-panel-2">
        <Icon size={20} className="text-amber" />
      </div>

      <p className="mt-4 text-2xl font-extrabold text-bone">{value}</p>
      <p className="mt-1 text-sm text-slate">{label}</p>
    </div>
  );
}
