"use client";

import { Bookmark } from "lucide-react";

export default function BookmarkButton({
  bookmarked,
  onToggle,
}: {
  bookmarked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={bookmarked}
      title={bookmarked ? "Remove bookmark" : "Bookmark this question"}
      className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
        bookmarked
          ? "border-amber bg-amber/10 text-amber"
          : "border-bone/15 text-slate hover:border-amber/50"
      }`}
    >
      <Bookmark size={16} fill={bookmarked ? "currentColor" : "none"} />
      {bookmarked ? "Bookmarked" : "Bookmark"}
    </button>
  );
}
