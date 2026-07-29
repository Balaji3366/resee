"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { CareerProfileAI, OnboardingAnswers } from "@/types/onboarding";

export default function StepSummary({
  userId,
  answers,
}: {
  userId: string;
  answers: OnboardingAnswers;
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<CareerProfileAI | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function generate() {
      setLoading(true);
      setErrorMessage(null);

      try {
        const res = await fetch("/api/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, answers }),
        });

        const json = await res.json();

        if (cancelled) return;

        if (!json.success) {
          setErrorMessage(json.message || "Something went wrong.");
          toast.error(json.message || "Something went wrong.");
        } else {
          setSummary(json.data);
        }
      } catch {
        if (!cancelled) {
          setErrorMessage("Something went wrong while generating your career profile.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    generate();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="py-6 text-center">
        <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-amber/30 border-t-amber-dim" />

        <h2 className="font-display text-2xl font-bold text-bone">
          RESEE AI is building your career profile...
        </h2>

        <p className="mt-3 text-slate">
          Analyzing your goals and generating a personalized starting point.
        </p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="py-6 text-center">
        <h2 className="font-display text-2xl font-bold text-bone">
          We couldn&apos;t generate your profile
        </h2>

        <p className="mt-3 text-slate">{errorMessage}</p>

        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="mt-8 w-full rounded-xl bg-amber py-4 text-lg font-bold text-white transition hover:bg-amber-dim"
        >
          Continue to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-3xl font-extrabold text-bone">
        Your Career Profile is Ready
      </h2>

      <div className="mt-6 rounded-2xl border border-amber/20 bg-panel p-6 text-center">
        <p className="text-sm font-medium text-slate">Career Health Score</p>
        <p className="text-5xl font-extrabold text-amber">
          {summary?.careerHealthScore}
        </p>
      </div>

      <p className="mt-6 text-bone">{summary?.summary}</p>

      <div className="mt-6 grid gap-4">
        <div>
          <p className="font-bold text-bone">Strengths</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-bone">
            {summary?.strengths.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-bold text-bone">Gaps to Close</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-bone">
            {summary?.gaps.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-bold text-bone">Focus Areas</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-bone">
            {summary?.focusAreas.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      </div>

      <button
        type="button"
        onClick={() => router.push("/dashboard")}
        className="mt-8 w-full rounded-xl bg-amber py-4 text-lg font-bold text-white transition hover:bg-amber-dim"
      >
        Go to Dashboard
      </button>
    </div>
  );
}
