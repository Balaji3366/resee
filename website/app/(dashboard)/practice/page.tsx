"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ListChecks, CalendarClock, ClipboardList, History } from "lucide-react";
import ContinuePracticePanel from "@/components/practice/ContinuePracticePanel";
import PracticeCategoryCard from "@/components/practice/PracticeCategoryCard";
import PracticeTypeCard from "@/components/practice/PracticeTypeCard";
import { usePracticeCatalog } from "@/hooks/usePracticeCatalog";
import { useContinuePractice } from "@/hooks/useContinuePractice";

export default function PracticeDashboardPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: catalog, loading: catalogLoading } = usePracticeCatalog();
  const { data: continueItems, loading: continueLoading } = useContinuePractice();

  const topics = catalog?.topics ?? [];
  const categories = catalog?.categories ?? [];

  const availableCountByCategory = new Map<string, number>();
  for (const topic of topics) {
    if (topic.isAvailable && topic.category) {
      availableCountByCategory.set(
        topic.category.slug,
        (availableCountByCategory.get(topic.category.slug) ?? 0) + 1
      );
    }
  }

  const filteredTopics = selectedCategory
    ? topics.filter((t) => t.category?.slug === selectedCategory)
    : topics;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-bone md:text-4xl">Practice</h1>

        <p className="mt-2 text-slate">
          Sharpen your skills, take mock tests, and track your improvement.
        </p>
      </div>

      <ContinuePracticePanel
        items={continueItems}
        loading={continueLoading}
        categories={categories}
      />

      {/* Practice Types */}

      <h2 className="mb-4 text-lg font-semibold text-slate">Practice Types</h2>

      <div className="mb-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <PracticeTypeCard
          title="Topic-wise Practice"
          description="Focused practice on a single topic, at your own pace."
          icon={ListChecks}
          href="#topics"
        />

        <PracticeTypeCard
          title="Daily Challenge"
          description="A fresh mix of questions every day."
          icon={CalendarClock}
          href="/practice/daily"
        />

        <PracticeTypeCard
          title="Mock Test"
          description="Timed, full-length tests that simulate the real thing."
          icon={ClipboardList}
          href="/practice/mock-tests"
        />

        <PracticeTypeCard
          title="Previous Attempts"
          description="Review your history and see how you've improved."
          icon={History}
          href="/practice/history"
        />
      </div>

      {/* Categories */}

      <h2 className="mb-4 text-lg font-semibold text-slate">Practice Categories</h2>

      <div className="mb-10 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {categories.map((category) => (
          <PracticeCategoryCard
            key={category.id}
            name={category.name}
            icon={category.icon}
            availableCount={availableCountByCategory.get(category.slug) ?? 0}
            active={selectedCategory === category.slug}
            onClick={() =>
              setSelectedCategory((prev) => (prev === category.slug ? null : category.slug))
            }
          />
        ))}
      </div>

      {/* Topics */}

      <h2 id="topics" className="mb-4 scroll-mt-24 text-lg font-semibold text-slate">
        Topics
      </h2>

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
          {filteredTopics.map((topic) => {
            const card = (
              <motion.div
                whileHover={topic.isAvailable ? { y: -4 } : {}}
                className={`h-full rounded-3xl border p-7 shadow-md transition-shadow duration-300 ${
                  topic.isAvailable
                    ? "border-amber/20 bg-panel hover:shadow-2xl"
                    : "border-dashed border-bone/15 bg-panel"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{topic.icon}</span>

                  {!topic.isAvailable && (
                    <span className="rounded-full bg-panel-2 px-3 py-1 text-xs font-bold text-slate">
                      Coming Soon
                    </span>
                  )}
                </div>

                <h3 className="mt-4 text-xl font-bold text-bone">{topic.title}</h3>
                <p className="mt-2 text-sm text-slate">{topic.description}</p>

                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate">
                  <span className="rounded-full bg-panel-2 px-3 py-1 capitalize">
                    {topic.difficulty}
                  </span>
                  <span className="rounded-full bg-panel-2 px-3 py-1">
                    {topic.questionCount} questions
                  </span>
                  <span className="rounded-full bg-panel-2 px-3 py-1">
                    ~{topic.estimatedMinutes} min
                  </span>
                </div>

                {topic.isAvailable && topic.bestScore !== null && (
                  <p className="mt-4 text-sm font-semibold text-amber">
                    Best score: {topic.bestScore}%
                  </p>
                )}
              </motion.div>
            );

            return topic.isAvailable ? (
              <Link key={topic.id} href={`/practice/${topic.slug}`}>
                {card}
              </Link>
            ) : (
              <button
                key={topic.id}
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
