"use client";

import { use } from "react";
import BackNavigation from "@/components/BackNavigation";
import CourseExamRunner from "@/components/learning/CourseExamRunner";
import { useCourseExam } from "@/hooks/useCourseExam";

export default function CourseExamPage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = use(params);
  const { data: exam, loading, error } = useCourseExam(courseSlug);

  return (
    <div className="mx-auto max-w-3xl">
      <BackNavigation href={`/learning/${courseSlug}`} label="Back to course" />

      {loading && (
        <div className="h-64 animate-pulse rounded-3xl border border-amber/20 bg-panel" />
      )}

      {!loading && (error || !exam) && (
        <div className="rounded-3xl border border-amber/20 bg-panel p-8 text-center text-slate shadow-md">
          {error || "Couldn't load this exam."}
        </div>
      )}

      {!loading && exam && <CourseExamRunner courseSlug={courseSlug} exam={exam} />}
    </div>
  );
}
