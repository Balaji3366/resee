import Link from "next/link";

export default function ProgressEmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-bone/15 bg-panel p-10 text-center shadow-md">
      <h2 className="font-display text-2xl font-bold text-bone">Your journey starts today.</h2>

      <p className="mx-auto mt-2 max-w-md text-slate">
        Complete a lesson or practice a topic to start building your progress here — streaks,
        achievements, and skill progress all begin with your first step.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/learning"
          className="rounded-xl bg-amber px-6 py-3 font-semibold text-white transition hover:bg-amber-dim"
        >
          Start Learning
        </Link>

        <Link
          href="/practice"
          className="rounded-xl border border-bone/15 px-6 py-3 font-semibold text-bone transition hover:border-amber"
        >
          Start Practicing
        </Link>
      </div>
    </div>
  );
}
