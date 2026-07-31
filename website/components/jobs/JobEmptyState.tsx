import Link from "next/link";

export default function JobEmptyState({
  message = "Search and filter to find roles that match what you're looking for.",
}: {
  message?: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-bone/15 bg-panel p-10 text-center shadow-md">
      <h2 className="font-display text-2xl font-bold text-bone">Start exploring opportunities.</h2>

      <p className="mx-auto mt-2 max-w-md text-slate">{message}</p>

      <div className="mt-6">
        <Link
          href="/jobs/search"
          className="rounded-xl bg-amber px-6 py-3 font-semibold text-white transition hover:bg-amber-dim"
        >
          Search Jobs
        </Link>
      </div>
    </div>
  );
}
