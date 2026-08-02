"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Switch from "@/components/ui/Switch";
import { useAdminFeatureFlags } from "@/hooks/useAdminFeatureFlags";

export default function AdminFeatureFlagsPage() {
  const { data: flags, loading, toggle } = useAdminFeatureFlags();

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/ai"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-amber hover:underline"
      >
        <ArrowLeft size={16} />
        Back to AI Platform
      </Link>

      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-bone md:text-4xl">
          AI Feature Flags
        </h1>
        <p className="mt-2 text-slate">
          Toggle AI capabilities on/off without a deploy. All start disabled — no AI feature is live
          to end users yet.
        </p>
      </div>

      {loading && (
        <div className="h-64 animate-pulse rounded-3xl border border-amber/20 bg-panel" />
      )}

      {!loading && (
        <div className="space-y-3">
          {(flags ?? []).map((flag) => (
            <div
              key={flag.slug}
              className="flex items-center justify-between gap-4 rounded-2xl border border-amber/20 bg-panel p-5 shadow-md"
            >
              <div>
                <p className="font-semibold text-bone">{flag.slug}</p>
                {flag.description && <p className="mt-1 text-sm text-slate">{flag.description}</p>}
              </div>

              <Switch
                checked={flag.enabled}
                onCheckedChange={(enabled) => toggle(flag.slug, enabled)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
