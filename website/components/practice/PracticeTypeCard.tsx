import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface PracticeTypeCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
}

export default function PracticeTypeCard({
  title,
  description,
  icon: Icon,
  href,
}: PracticeTypeCardProps) {
  const card = (
    <div
      className={`h-full rounded-3xl border p-7 shadow-md transition-all duration-300 ${
        href
          ? "border-amber/20 bg-panel hover:-translate-y-2 hover:shadow-2xl"
          : "border-dashed border-bone/15 bg-panel"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-panel-2">
          <Icon size={24} className={href ? "text-amber" : "text-slate"} />
        </div>

        {!href && (
          <span className="rounded-full bg-panel-2 px-3 py-1 text-xs font-bold text-slate">
            Coming Soon
          </span>
        )}
      </div>

      <h3 className="mt-6 text-lg font-semibold text-bone">{title}</h3>
      <p className="mt-1 text-sm text-slate">{description}</p>
    </div>
  );

  if (!href) {
    return (
      <button
        type="button"
        onClick={() => alert("🚧 Coming Soon")}
        className="text-left"
      >
        {card}
      </button>
    );
  }

  return <Link href={href}>{card}</Link>;
}
