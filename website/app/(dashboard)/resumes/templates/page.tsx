"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useResumeTemplates } from "@/hooks/useResumeTemplates";
import TemplateCard from "@/components/resume-builder/TemplateCard";

export default function ResumeTemplatesPage() {
  const router = useRouter();
  const { data: templates, loading } = useResumeTemplates();
  const [creating, setCreating] = useState<string | null>(null);

  async function handleSelect(templateSlug: string) {
    setCreating(templateSlug);
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateSlug }),
      });
      const json = await res.json();

      if (json.success) {
        router.push(`/resumes/${json.resumeId}`);
      } else {
        setCreating(null);
      }
    } catch {
      setCreating(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <Link href="/resumes" className="flex items-center gap-1.5 text-sm font-semibold text-slate hover:text-bone">
        <ArrowLeft size={16} /> Back to My Resumes
      </Link>

      <h1 className="mt-4 font-display text-3xl font-extrabold text-bone md:text-4xl">Choose a Template</h1>
      <p className="mt-2 text-slate">Pick a starting point — you can switch templates any time.</p>

      {loading ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-80 animate-pulse rounded-3xl border border-amber/20 bg-panel" />
          ))}
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {(templates ?? []).map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={() => handleSelect(template.slug)}
            />
          ))}
        </div>
      )}

      {creating ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <p className="rounded-2xl bg-panel px-6 py-4 font-semibold text-bone shadow-2xl">
            Creating your resume...
          </p>
        </div>
      ) : null}
    </div>
  );
}
