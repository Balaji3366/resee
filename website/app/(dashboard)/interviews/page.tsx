"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function InterviewsLandingPage() {
  const router = useRouter();

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center py-16 text-center">
      <h1 className="font-display text-4xl font-extrabold text-bone md:text-5xl">
        Practice your next interview with confidence.
      </h1>

      <p className="mt-4 max-w-lg text-lg text-slate">
        Choose your target role and we&apos;ll prepare a realistic interview experience.
      </p>

      <button
        onClick={() => router.push("/interviews/setup")}
        className="mt-8 flex items-center gap-2 rounded-xl bg-amber px-8 py-4 text-lg font-bold text-white transition hover:bg-amber-dim"
      >
        Start Interview <ArrowRight size={20} />
      </button>

      <div className="mt-6 flex items-center gap-6">
        <Link
          href="/interviews/history"
          className="text-sm font-semibold text-slate hover:text-bone"
        >
          View Interview History
        </Link>
        <Link
          href="/interviews/bookmarks"
          className="text-sm font-semibold text-slate hover:text-bone"
        >
          Bookmarked Questions
        </Link>
      </div>
    </div>
  );
}
