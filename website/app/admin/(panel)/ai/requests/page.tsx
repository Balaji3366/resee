"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import Badge from "@/components/ui/Badge";
import { useAdminAIRequests } from "@/hooks/useAdminAIRequests";

const STATUS_VARIANT: Record<string, "success" | "error" | "warning" | "neutral"> = {
  success: "success",
  error: "error",
  rate_limited: "warning",
  cached: "neutral",
};

export default function AdminAIRequestsPage() {
  const [page, setPage] = useState(1);
  const { data: requests, totalPages, loading } = useAdminAIRequests(page, 25);

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        href="/admin/ai"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-amber hover:underline"
      >
        <ArrowLeft size={16} />
        Back to AI Platform
      </Link>

      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-bone md:text-4xl">
          AI Request Logs
        </h1>
        <p className="mt-2 text-slate">Every orchestrated AI request, most recent first.</p>
      </div>

      {loading && (
        <div className="h-64 animate-pulse rounded-3xl border border-amber/20 bg-panel" />
      )}

      {!loading && (
        <div className="overflow-x-auto rounded-3xl border border-amber/20 bg-panel shadow-md">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-bone/10 text-slate">
                <th className="px-6 py-4 font-semibold">Feature</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Model</th>
                <th className="px-6 py-4 font-semibold">Tokens</th>
                <th className="px-6 py-4 font-semibold">Latency</th>
                <th className="px-6 py-4 font-semibold">Error</th>
                <th className="px-6 py-4 font-semibold">When</th>
              </tr>
            </thead>
            <tbody>
              {(requests ?? []).map((r) => (
                <tr key={r.id} className="border-b border-bone/5">
                  <td className="px-6 py-4 font-medium text-bone">{r.feature}</td>
                  <td className="px-6 py-4">
                    <Badge variant={STATUS_VARIANT[r.status] ?? "neutral"}>{r.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-slate">{r.model}</td>
                  <td className="px-6 py-4 text-slate">{r.totalTokens ?? "—"}</td>
                  <td className="px-6 py-4 text-slate">
                    {r.latencyMs !== null ? `${r.latencyMs} ms` : "—"}
                  </td>
                  <td
                    className="max-w-xs truncate px-6 py-4 text-slate"
                    title={r.errorMessage ?? undefined}
                  >
                    {r.errorMessage ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-slate">{new Date(r.createdAt).toLocaleString()}</td>
                </tr>
              ))}

              {(requests ?? []).length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate">
                    No AI requests logged yet — this is expected until Phase 1 features go live.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} className="mt-8" />
    </div>
  );
}
