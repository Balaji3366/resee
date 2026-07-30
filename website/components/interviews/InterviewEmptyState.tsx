import Link from "next/link";

export default function InterviewEmptyState({
  message = "Pick an interview type, role, and difficulty to begin.",
}: {
  message?: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-bone/15 bg-panel p-8 text-center shadow-md">
      <h2 className="text-lg font-semibold text-bone">Start your first mock interview</h2>
      <p className="mt-1 text-sm text-slate">{message}</p>

      <Link
        href="/interviews/setup"
        className="mt-6 inline-block rounded-xl bg-amber px-6 py-3 font-semibold text-white transition hover:bg-amber-dim"
      >
        Start New Interview
      </Link>
    </div>
  );
}
