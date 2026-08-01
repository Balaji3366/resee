"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CourseExamRunner from "@/components/learning/CourseExamRunner";
import { useCourseExam } from "@/hooks/useCourseExam";

export default function CourseExamPage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = use(params);
  const { data: exam, loading, error } = useCourseExam(courseSlug);

  return (
    <div className="mx-auto max-w-3xl">
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

      {!loading && (error || !exam) && (
        <div className="rounded-3xl border border-amber/20 bg-panel p-8 text-center text-slate shadow-md">
          {error || "Couldn't load this exam."}
        </div>
      )}

      {!loading && exam && <CourseExamRunner courseSlug={courseSlug} exam={exam} />}
    </div>
  );
}
