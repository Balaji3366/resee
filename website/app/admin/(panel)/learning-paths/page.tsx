"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useAdminCourses } from "@/hooks/useAdminCourses";
import type { CourseStatus } from "@/types/admin";

const STATUS_STYLES: Record<CourseStatus, string> = {
  draft: "bg-panel-2 text-slate",
  published: "bg-teal-dim/20 text-teal",
  archived: "bg-red-400/10 text-red-400",
};

export default function AdminLearningPathsPage() {
  const { data: courses, loading } = useAdminCourses();

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-bone md:text-4xl">
            Learning Paths
          </h1>
          <p className="mt-2 text-slate">Manage courses, modules, lessons, and quizzes.</p>
        </div>

        <Link
          href="/admin/learning-paths/new"
          className="flex items-center gap-2 rounded-xl bg-amber px-6 py-3 font-bold text-white transition hover:bg-amber-dim"
        >
          <Plus size={18} />
          New Learning Path
        </Link>
      </div>

      {loading && (
        <div className="h-64 animate-pulse rounded-3xl border border-amber/20 bg-panel" />
      )}

      {!loading && (
        <div className="overflow-x-auto rounded-3xl border border-amber/20 bg-panel shadow-md">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-bone/10 text-slate">
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Modules</th>
                <th className="px-6 py-4 font-semibold">Lessons</th>
                <th className="px-6 py-4 font-semibold">Updated</th>
              </tr>
            </thead>
            <tbody>
              {(courses ?? []).map((course) => (
                <tr
                  key={course.id}
                  className="cursor-pointer border-b border-bone/5 transition hover:bg-panel-2/30"
                  onClick={() => (window.location.href = `/admin/learning-paths/${course.id}`)}
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold text-bone">{course.title}</p>
                    <p className="text-xs text-slate">{course.slug}</p>
                  </td>
                  <td className="px-6 py-4 text-slate">
                    {course.category ? `${course.category.icon} ${course.category.name}` : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${STATUS_STYLES[course.status]}`}
                    >
                      {course.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate">{course.moduleCount}</td>
                  <td className="px-6 py-4 text-slate">{course.lessonCount}</td>
                  <td className="px-6 py-4 text-slate">
                    {new Date(course.updatedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}

              {(courses ?? []).length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate">
                    No learning paths yet — create your first one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
