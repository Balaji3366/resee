"use client";

import { use, useState } from "react";
import Link from "next/link";
import ModuleLessonTree from "@/components/learning/ModuleLessonTree";
import { useCourse } from "@/hooks/useCourse";

export default function CoursePage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = use(params);

  const [enrolling, setEnrolling] = useState(false);

  const { data: course, loading, error, refetch } = useCourse(courseSlug);

  async function handleEnroll() {
    setEnrolling(true);

    try {
      const res = await fetch(`/api/learning/courses/${courseSlug}/enroll`, {
        method: "POST",
      });
      const json = await res.json();

      if (json.success) {
        await refetch();
      } else {
        alert(json.message || "Failed to enroll.");
      }
    } finally {
      setEnrolling(false);
    }
  }

  function findResumeSlug(): string | null {
    if (!course) return null;

    for (const mod of course.modules) {
      if (!mod.unlocked) continue;

      const nextLesson = mod.lessons.find((l) => !l.completed);
      if (nextLesson) return nextLesson.slug;

      if (mod.quiz && !mod.quiz.passed) return mod.quiz.slug;
    }

    // everything unlocked is complete — send them to the last accessible item
    const lastUnlocked = [...course.modules].reverse().find((m) => m.unlocked);
    if (lastUnlocked?.quiz) return lastUnlocked.quiz.slug;
    return lastUnlocked?.lessons[lastUnlocked.lessons.length - 1]?.slug ?? null;
  }

  return (
    <div className="mx-auto max-w-4xl">
              {loading && (
                <div className="h-64 animate-pulse rounded-3xl border border-amber/20 bg-panel" />
              )}

              {!loading && (error || !course) && (
                <div className="rounded-3xl border border-amber/20 bg-panel p-8 text-center text-slate shadow-md">
                  Couldn&apos;t load this course.
                </div>
              )}

              {!loading && course && (
                <>
                  <div className="rounded-3xl border border-amber/20 bg-panel p-8 shadow-md">
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <span className="text-4xl">{course.icon}</span>

                        <h1 className="font-display mt-4 text-3xl font-extrabold text-bone">
                          {course.title}
                        </h1>

                        <p className="mt-2 text-slate">{course.tagline}</p>
                      </div>

                      {!course.isAvailable && (
                        <span className="shrink-0 rounded-full bg-panel-2 px-3 py-1 text-xs font-bold text-slate">
                          Coming Soon
                        </span>
                      )}
                    </div>

                    <p className="mt-6 leading-7 text-bone">{course.description}</p>

                    <div className="mt-6 flex flex-wrap gap-3 text-sm">
                      <span className="rounded-full bg-panel-2 px-4 py-2 capitalize text-slate">
                        {course.difficulty}
                      </span>

                      <span className="rounded-full bg-panel-2 px-4 py-2 text-slate">
                        ~{course.totalMinutes} min
                      </span>

                      <span className="rounded-full bg-panel-2 px-4 py-2 text-slate">
                        {course.totalLessons} lessons
                      </span>
                    </div>

                    {course.isEnrolled && (
                      <div className="mt-6">
                        <div className="mb-2 flex justify-between text-sm text-slate">
                          <span>Progress</span>
                          <span className="font-semibold text-bone">
                            {course.progressPercent}%
                          </span>
                        </div>

                        <div className="h-2 rounded-full bg-panel-2">
                          <div
                            className="h-2 rounded-full bg-amber transition-all duration-700"
                            style={{ width: `${course.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="mt-8">
                      {!course.isAvailable ? (
                        <button
                          disabled
                          className="w-full cursor-not-allowed rounded-xl bg-panel-2 py-4 text-lg font-bold text-slate"
                        >
                          Coming Soon
                        </button>
                      ) : course.isEnrolled ? (
                        <Link
                          href={`/learning/${courseSlug}/${findResumeSlug() ?? ""}`}
                          className="flex w-full items-center justify-center rounded-xl bg-amber py-4 text-lg font-bold text-white transition hover:bg-amber-dim"
                        >
                          Continue
                        </Link>
                      ) : (
                        <button
                          onClick={handleEnroll}
                          disabled={enrolling}
                          className="w-full rounded-xl bg-amber py-4 text-lg font-bold text-white transition hover:bg-amber-dim disabled:opacity-60"
                        >
                          {enrolling ? "Enrolling..." : "Enroll"}
                        </button>
                      )}
                    </div>
                  </div>

                  {course.isEnrolled && (
                    <div className="mt-8">
                      <ModuleLessonTree modules={course.modules} courseSlug={courseSlug} />
                    </div>
                  )}
                </>
              )}
    </div>
  );
}
