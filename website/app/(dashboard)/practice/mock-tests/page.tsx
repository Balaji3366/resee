"use client";

import MockTestCard from "@/components/practice/MockTestCard";
import { useMockTests } from "@/hooks/useMockTests";

export default function MockTestsPage() {
  const { data: mockTests, loading } = useMockTests();

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-bone md:text-4xl">
          Mock Tests
        </h1>

        <p className="mt-2 text-slate">
          Timed, full-length tests that simulate real exam conditions.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-3xl border border-amber/20 bg-panel"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {(mockTests ?? []).map((test) => (
            <MockTestCard key={test.id} test={test} />
          ))}
        </div>
      )}
    </div>
  );
}
