import Link from "next/link";
import type { PracticeCategory } from "@/types/practice";

export default function PracticeEmptyState({
  categories,
  message = "Pick a category below to sharpen your skills and build confidence.",
}: {
  categories: PracticeCategory[];
  message?: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-bone/15 bg-panel p-8 text-center shadow-md">
      <h2 className="text-lg font-semibold text-bone">Start your first practice session</h2>
      <p className="mt-1 text-sm text-slate">{message}</p>

      {categories.length > 0 && (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <Link
              key={category.id}
              href="/practice"
              className="rounded-full bg-panel-2 px-4 py-2 text-sm font-semibold text-bone transition hover:bg-panel-2/70"
            >
              {category.icon} {category.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
