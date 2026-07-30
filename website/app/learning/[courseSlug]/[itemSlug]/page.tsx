"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, CheckCircle2, Lock } from "lucide-react";
import DashboardNavbar from "@/components/DashboardNavbar";
import DashboardSidebar from "@/components/DashboardSidebar";
import QuizRunner from "@/components/learning/QuizRunner";
import { useCourse } from "@/hooks/useCourse";
import type { LessonSummary, QuizSummary } from "@/types/learning";

type FlatItem =
  | { kind: "lesson"; moduleUnlocked: boolean; lesson: LessonSummary }
  | { kind: "quiz"; moduleUnlocked: boolean; quiz: QuizSummary };

export default function LessonOrQuizPage({
  params,
}: {
  params: Promise<{ courseSlug: string; itemSlug: string }>;
}) {
  const { courseSlug, itemSlug } = use(params);
  const router = useRouter();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [marking, setMarking] = useState(false);

  const { data: course, loading, error, refetch } = useCourse(courseSlug);

  const flatItems: FlatItem[] = useMemo(() => {
    if (!course) return [];

    const items: FlatItem[] = [];

    for (const mod of course.modules) {
      for (const lesson of mod.lessons) {
        items.push({ kind: "lesson", moduleUnlocked: mod.unlocked, lesson });
      }
      if (mod.quiz) {
        items.push({ kind: "quiz", moduleUnlocked: mod.unlocked, quiz: mod.quiz });
      }
    }

    return items;
  }, [course]);

  const currentIndex = flatItems.findIndex((item) =>
    item.kind === "lesson" ? item.lesson.slug === itemSlug : item.quiz.slug === itemSlug
  );

  const current = currentIndex >= 0 ? flatItems[currentIndex] : null;
  const previous = currentIndex > 0 ? flatItems[currentIndex - 1] : null;
  const next =
    currentIndex >= 0 && currentIndex < flatItems.length - 1
      ? flatItems[currentIndex + 1]
      : null;

  function slugOf(item: FlatItem) {
    return item.kind === "lesson" ? item.lesson.slug : item.quiz.slug;
  }

  async function handleMarkComplete() {
    if (!current || current.kind !== "lesson") return;

    setMarking(true);

    try {
      const res = await fetch(
        `/api/learning/courses/${courseSlug}/lessons/${current.lesson.slug}/complete`,
        { method: "POST" }
      );
      const json = await res.json();

      if (json.success) {
        await refetch();
        if (next) router.push(`/learning/${courseSlug}/${slugOf(next)}`);
      } else {
        alert(json.message || "Failed to mark lesson complete.");
      }
    } finally {
      setMarking(false);
    }
  }

  return (
    <section className="min-h-screen bg-ink pt-2 pb-16">
      <div className="mx-auto max-w-[96rem] px-6">
        <div className="flex gap-6 lg:gap-8">
          <DashboardSidebar
            mobileOpen={mobileNavOpen}
            onMobileClose={() => setMobileNavOpen(false)}
          />

          <div className="min-w-0 flex-1">
            <div className="mx-auto max-w-3xl">
              <DashboardNavbar onMenuClick={() => setMobileNavOpen(true)} />

              <Link
                href={`/learning/${courseSlug}`}
                className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-amber hover:underline"
              >
                <ArrowLeft size={16} />
                Back to course
              </Link>

              {loading && (
                <div className="h-64 animate-pulse rounded-3xl border border-amber/20 bg-panel" />
              )}

              {!loading && (error || !course || !current) && (
                <div className="rounded-3xl border border-amber/20 bg-panel p-8 text-center text-slate shadow-md">
                  Couldn&apos;t find this lesson.
                </div>
              )}

              {!loading && current && !current.moduleUnlocked && (
                <div className="rounded-3xl border border-amber/20 bg-panel p-8 text-center shadow-md">
                  <Lock className="mx-auto mb-4 text-slate" size={32} />

                  <h2 className="font-display text-2xl font-bold text-bone">
                    This module is locked
                  </h2>

                  <p className="mt-2 text-slate">
                    Complete the previous module&apos;s quiz to unlock this content.
                  </p>
                </div>
              )}

              {!loading && current && current.moduleUnlocked && current.kind === "lesson" && (
                <div className="rounded-3xl border border-amber/20 bg-panel p-8 shadow-md">
                  <h1 className="font-display text-3xl font-extrabold text-bone">
                    {current.lesson.title}
                  </h1>

                  <div className="prose prose-neutral mt-6 max-w-none text-bone prose-headings:font-display prose-headings:text-bone prose-a:text-amber prose-code:text-amber prose-pre:bg-panel-2">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {current.lesson.content ?? ""}
                    </ReactMarkdown>
                  </div>

                  {current.lesson.keyTakeaways && current.lesson.keyTakeaways.length > 0 && (
                    <div className="mt-8 rounded-2xl border border-amber/20 bg-panel-2/40 p-6">
                      <h3 className="font-semibold text-bone">Key Takeaways</h3>

                      <ul className="mt-3 list-disc space-y-2 pl-5 text-slate">
                        {current.lesson.keyTakeaways.map((point) => (
                          <li key={point}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-10 flex items-center justify-between gap-4">
                    {previous ? (
                      <Link
                        href={`/learning/${courseSlug}/${slugOf(previous)}`}
                        className="flex items-center gap-2 rounded-xl border border-bone/15 px-5 py-3 font-semibold text-bone transition hover:border-amber"
                      >
                        <ArrowLeft size={18} />
                        Previous
                      </Link>
                    ) : (
                      <span />
                    )}

                    <button
                      onClick={handleMarkComplete}
                      disabled={marking}
                      className="flex items-center gap-2 rounded-xl bg-amber px-6 py-3 font-bold text-white transition hover:bg-amber-dim disabled:opacity-60"
                    >
                      <CheckCircle2 size={18} />
                      {current.lesson.completed
                        ? next
                          ? "Next Lesson"
                          : "Completed"
                        : marking
                        ? "Saving..."
                        : "Mark as Complete"}
                    </button>
                  </div>
                </div>
              )}

              {!loading && current && current.moduleUnlocked && current.kind === "quiz" && (
                <QuizRunner
                  courseSlug={courseSlug}
                  quiz={current.quiz}
                  onPassed={() => refetch()}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
