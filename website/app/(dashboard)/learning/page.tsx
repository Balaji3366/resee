"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useLearningCatalog } from "@/hooks/useLearningCatalog";
import { useContinueLearning } from "@/hooks/useContinueLearning";
import { useDebounce } from "@/hooks/useDebounce";
import LearningRecommendationCard from "@/components/learning/ai/LearningRecommendationCard";

export default function LearningDashboardPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);

  const { data: catalog, loading: catalogLoading } = useLearningCatalog(debouncedSearch);
  const { data: continueData, loading: continueLoading } = useContinueLearning();

  const courses = catalog?.courses ?? [];
  const filteredCourses = selectedCategory
    ? courses.filter((c) => c.category?.slug === selectedCategory)
    : courses;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-bone md:text-4xl">Learning</h1>

        <p className="mt-2 text-slate">Structured paths to build real, career-ready skills.</p>
      </div>

      <LearningRecommendationCard />

      {/* Continue Learning */}

      {continueLoading ? (
        <div className="mb-10 h-28 animate-pulse rounded-3xl border border-amber/20 bg-panel" />
      ) : continueData ? (
        <div className="mb-10 rounded-3xl border border-amber/20 bg-panel p-7 shadow-md">
          <h2 className="text-lg font-semibold text-slate">Continue Learning</h2>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xl font-bold text-bone">{continueData.courseTitle}</p>

              <p className="mt-1 text-sm text-slate">
                {continueData.progressPercent}% complete
                {continueData.lastLessonTitle ? ` · Last: ${continueData.lastLessonTitle}` : ""}
              </p>
            </div>

            <Link
              href={`/learning/${continueData.courseSlug}/${continueData.resumeSlug}`}
              className="rounded-xl bg-amber px-6 py-3 font-semibold text-white transition hover:bg-amber-dim"
            >
              Continue
            </Link>
          </div>

          <div className="mt-4 h-2 rounded-full bg-panel-2">
            <div
              className="h-2 rounded-full bg-amber transition-all duration-700"
              style={{ width: `${continueData.progressPercent}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="mb-10 rounded-3xl border border-dashed border-bone/15 bg-panel p-7 text-center shadow-md">
          <h2 className="text-lg font-semibold text-bone">Choose your first learning path</h2>

          <p className="mt-1 text-sm text-slate">
            Pick a path below to start building real, career-ready skills.
          </p>
        </div>
      )}

      {/* Search */}

      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-bone/15 bg-panel px-4 py-3">
        <Search size={18} className="text-slate" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search courses…"
          className="w-full bg-transparent text-bone outline-none placeholder:text-slate"
        />
      </div>

      {/* Categories */}

      {catalog && catalog.categories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              selectedCategory === null
                ? "border-amber bg-amber text-white"
                : "border-bone/15 text-slate hover:border-amber/50"
            }`}
          >
            All
          </button>

          {catalog.categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                selectedCategory === cat.slug
                  ? "border-amber bg-amber text-white"
                  : "border-bone/15 text-slate hover:border-amber/50"
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Recommended Learning Paths */}

      <h2 className="mb-4 text-lg font-semibold text-slate">Recommended Learning Paths</h2>

      {catalogLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-56 animate-pulse rounded-3xl border border-amber/20 bg-panel"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredCourses.map((course) => {
            const card = (
              <motion.div
                whileHover={course.isAvailable ? { y: -4 } : {}}
                className={`h-full rounded-3xl border p-7 shadow-md transition-shadow duration-300 ${
                  course.isAvailable
                    ? "border-amber/20 bg-panel hover:shadow-2xl"
                    : "border-dashed border-bone/15 bg-panel"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{course.icon}</span>

                  {!course.isAvailable && (
                    <span className="rounded-full bg-panel-2 px-3 py-1 text-xs font-bold text-slate">
                      Coming Soon
                    </span>
                  )}
                </div>

                <h3 className="mt-4 text-xl font-bold text-bone">{course.title}</h3>

                <p className="mt-2 text-sm text-slate">{course.tagline}</p>

                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate">
                  <span className="rounded-full bg-panel-2 px-3 py-1 capitalize">
                    {course.difficulty}
                  </span>

                  <span className="rounded-full bg-panel-2 px-3 py-1">
                    {course.lessonCount} lessons
                  </span>
                </div>

                {course.isAvailable && course.isEnrolled && (
                  <div className="mt-4 h-2 rounded-full bg-panel-2">
                    <div
                      className="h-2 rounded-full bg-amber transition-all duration-700"
                      style={{ width: `${course.progressPercent}%` }}
                    />
                  </div>
                )}
              </motion.div>
            );

            return course.isAvailable ? (
              <Link key={course.id} href={`/learning/${course.slug}`}>
                {card}
              </Link>
            ) : (
              <button
                key={course.id}
                type="button"
                onClick={() => alert("🚧 Coming Soon")}
                className="text-left"
              >
                {card}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
