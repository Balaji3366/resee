import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function AdminUnauthorizedPage() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-ink px-6">
      <div className="w-full max-w-md rounded-[32px] border border-amber/20 bg-panel p-10 text-center shadow-2xl">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-panel-2">
          <ShieldAlert size={28} className="text-red-400" />
        </div>

        <h1 className="font-display text-2xl font-extrabold text-bone">Access Restricted</h1>

        <p className="mt-3 text-slate">
          Your account doesn&apos;t have permission to access the admin panel. If you believe
          this is a mistake, contact a platform administrator.
        </p>

        <Link
          href="/dashboard"
          className="mt-8 flex w-full items-center justify-center rounded-xl bg-amber py-4 font-bold text-white transition hover:bg-amber-dim"
        >
          Back to Dashboard
        </Link>
      </div>
    </section>
  );
}
