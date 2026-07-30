import Link from "next/link";
import { Lock, CheckCircle2, Circle } from "lucide-react";
import type { ModuleSummary } from "@/types/learning";

export default function ModuleLessonTree({
  modules,
  courseSlug,
  currentItemSlug,
}: {
  modules: ModuleSummary[];
  courseSlug: string;
  currentItemSlug?: string;
}) {
  return (
    <div className="space-y-6">
      {modules.map((mod, i) => (
        <div
          key={mod.id}
          className="rounded-2xl border border-amber/20 bg-panel p-6"
        >
          <div className="flex items-center gap-3">
            {!mod.unlocked ? (
              <Lock size={18} className="text-slate" />
            ) : (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber text-xs font-bold text-white">
                {i + 1}
              </span>
            )}

            <h3 className="font-semibold text-bone">{mod.title}</h3>
          </div>

          <div className="mt-4 space-y-1 pl-2">
            {mod.lessons.map((lesson) => {
              const isCurrent = lesson.slug === currentItemSlug;

              const rowContent = (
                <>
                  {lesson.completed ? (
                    <CheckCircle2 size={16} className="shrink-0 text-amber" />
                  ) : (
                    <Circle size={16} className="shrink-0 text-slate" />
                  )}

                  <span className={isCurrent ? "font-semibold text-amber" : "text-bone"}>
                    {lesson.title}
                  </span>
                </>
              );

              return mod.unlocked ? (
                <Link
                  key={lesson.id}
                  href={`/learning/${courseSlug}/${lesson.slug}`}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 transition hover:bg-panel-2/40"
                >
                  {rowContent}
                </Link>
              ) : (
                <div
                  key={lesson.id}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate opacity-60"
                >
                  {rowContent}
                </div>
              );
            })}

            {mod.quiz &&
              (mod.unlocked ? (
                <Link
                  href={`/learning/${courseSlug}/${mod.quiz.slug}`}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 transition hover:bg-panel-2/40 ${
                    mod.quiz.slug === currentItemSlug ? "font-semibold text-amber" : "text-bone"
                  }`}
                >
                  {mod.quiz.passed ? (
                    <CheckCircle2 size={16} className="shrink-0 text-amber" />
                  ) : (
                    <Circle size={16} className="shrink-0 text-slate" />
                  )}
                  {mod.quiz.title}
                </Link>
              ) : (
                <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate opacity-60">
                  <Lock size={16} className="shrink-0" />
                  {mod.quiz.title}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
