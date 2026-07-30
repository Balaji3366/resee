"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import DashboardSidebar from "@/components/DashboardSidebar";
import QuizOptionButton from "@/components/learning/QuizOptionButton";
import { usePracticeBookmarks } from "@/hooks/usePracticeBookmarks";

export default function PracticeBookmarksPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { data: bookmarks, loading, refetch } = usePracticeBookmarks();

  async function removeBookmark(questionId: string) {
    await fetch(`/api/practice/bookmarks/${questionId}`, { method: "DELETE" });
    refetch();
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

              <div className="mb-8">
                <h1 className="font-display text-3xl font-extrabold text-bone md:text-4xl">
                  Bookmarked Questions
                </h1>

                <p className="mt-2 text-slate">Questions you&apos;ve saved to revisit later.</p>
              </div>

              {loading && (
                <div className="h-64 animate-pulse rounded-3xl border border-amber/20 bg-panel" />
              )}

              {!loading && (!bookmarks || bookmarks.length === 0) && (
                <div className="rounded-3xl border border-dashed border-bone/15 bg-panel p-8 text-center shadow-md">
                  <h2 className="text-lg font-semibold text-bone">No bookmarks yet</h2>
                  <p className="mt-1 text-sm text-slate">
                    Bookmark a question while practicing to save it here.
                  </p>
                </div>
              )}

              {!loading && bookmarks && bookmarks.length > 0 && (
                <div className="space-y-4">
                  {bookmarks.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className="rounded-2xl border border-amber/20 bg-panel p-6 shadow-md"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Link
                            href={`/practice/${bookmark.topicSlug}`}
                            className="text-xs font-semibold text-amber hover:underline"
                          >
                            {bookmark.topicTitle}
                          </Link>

                          <p className="mt-1 font-semibold text-bone">{bookmark.question}</p>
                        </div>

                        <button
                          onClick={() => removeBookmark(bookmark.id)}
                          className="shrink-0 rounded-xl border border-bone/15 px-3 py-1.5 text-xs font-semibold text-slate transition hover:border-red-400/50"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="mt-4 space-y-2">
                        {bookmark.options.map((opt) => (
                          <QuizOptionButton
                            key={opt.id}
                            label={opt.text}
                            selected={false}
                            state={
                              bookmark.correctOptionIds.includes(opt.id) ? "correct" : "default"
                            }
                            onClick={() => {}}
                            disabled
                          />
                        ))}
                      </div>

                      {bookmark.explanation && (
                        <p className="mt-3 text-sm text-slate">{bookmark.explanation}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
