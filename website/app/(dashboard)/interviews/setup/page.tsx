"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PickerChipGrid from "@/components/interviews/PickerChipGrid";
import { useInterviewCategories } from "@/hooks/useInterviewCategories";
import { useInterviewRoles } from "@/hooks/useInterviewRoles";
import { useInterviewSets } from "@/hooks/useInterviewSets";
import type { InterviewDifficulty } from "@/types/interview";

const DIFFICULTIES: { slug: InterviewDifficulty; label: string }[] = [
  { slug: "beginner", label: "Beginner" },
  { slug: "intermediate", label: "Intermediate" },
  { slug: "advanced", label: "Advanced" },
];

export default function InterviewSetupPage() {
  const router = useRouter();

  const { data: categories, loading: categoriesLoading } = useInterviewCategories();
  const { data: roles, loading: rolesLoading } = useInterviewRoles();
  const { data: sets, loading: setsLoading } = useInterviewSets();

  const [categorySlug, setCategorySlug] = useState<string | null>(null);
  const [roleSlug, setRoleSlug] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<InterviewDifficulty | null>(null);
  const [notAvailable, setNotAvailable] = useState(false);

  const availableSets = useMemo(() => sets ?? [], [sets]);

  const roleOptions = useMemo(
    () =>
      (roles ?? []).map((role) => ({
        slug: role.slug,
        label: role.name,
        icon: role.icon,
        available: categorySlug
          ? availableSets.some(
              (s) => s.category.slug === categorySlug && s.role.slug === role.slug && s.isAvailable
            )
          : false,
      })),
    [roles, categorySlug, availableSets]
  );

  const difficultyOptions = useMemo(
    () =>
      DIFFICULTIES.map((d) => ({
        slug: d.slug,
        label: d.label,
        available:
          categorySlug && roleSlug
            ? availableSets.some(
                (s) =>
                  s.category.slug === categorySlug &&
                  s.role.slug === roleSlug &&
                  s.difficulty === d.slug &&
                  s.isAvailable
              )
            : false,
      })),
    [categorySlug, roleSlug, availableSets]
  );

  const loading = categoriesLoading || rolesLoading || setsLoading;

  function handleCategorySelect(slug: string) {
    setCategorySlug(slug);
    setRoleSlug(null);
    setDifficulty(null);
    setNotAvailable(false);
  }

  function handleRoleSelect(slug: string) {
    setRoleSlug(slug);
    setDifficulty(null);
    setNotAvailable(false);
  }

  function handleStart() {
    const match = availableSets.find(
      (s) =>
        s.category.slug === categorySlug &&
        s.role.slug === roleSlug &&
        s.difficulty === difficulty &&
        s.isAvailable
    );

    if (match) {
      router.push(`/interviews/${match.slug}`);
    } else {
      setNotAvailable(true);
    }
  }

  const canStart = Boolean(categorySlug && roleSlug && difficulty);

  const matchedSet = useMemo(
    () =>
      availableSets.find(
        (s) =>
          s.category.slug === categorySlug &&
          s.role.slug === roleSlug &&
          s.difficulty === difficulty &&
          s.isAvailable
      ) ?? null,
    [availableSets, categorySlug, roleSlug, difficulty]
  );

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/interviews"
        className="flex items-center gap-1.5 text-sm font-semibold text-slate hover:text-bone"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <h1 className="mt-4 font-display text-3xl font-extrabold text-bone md:text-4xl">
        Set Up Your Interview
      </h1>
      <p className="mt-2 text-slate">Choose an interview type, career role, and difficulty.</p>

      {loading ? (
        <div className="mt-8 h-64 animate-pulse rounded-3xl border border-amber/20 bg-panel" />
      ) : (
        <div className="mt-8 space-y-8 rounded-3xl border border-amber/20 bg-panel p-8 shadow-md">
          <PickerChipGrid
            label="Interview Type"
            options={(categories ?? []).map((c) => ({
              slug: c.slug,
              label: c.name,
              icon: c.icon,
              available: c.isAvailable,
            }))}
            selectedSlug={categorySlug}
            onSelect={handleCategorySelect}
          />

          {categorySlug && (
            <PickerChipGrid
              label="Career Role"
              options={roleOptions}
              selectedSlug={roleSlug}
              onSelect={handleRoleSelect}
            />
          )}

          {categorySlug && roleSlug && (
            <PickerChipGrid
              label="Difficulty"
              options={difficultyOptions}
              selectedSlug={difficulty}
              onSelect={(slug) => {
                setDifficulty(slug as InterviewDifficulty);
                setNotAvailable(false);
              }}
            />
          )}

          {matchedSet && (
            <div className="rounded-xl border border-bone/10 bg-ink p-4 text-sm text-slate">
              Estimated duration: <strong className="text-bone">~{matchedSet.estimatedMinutes} min</strong>{" "}
              · {matchedSet.questionCount} questions
            </div>
          )}

          {notAvailable && (
            <div className="rounded-xl border border-dashed border-bone/15 bg-ink p-4 text-sm text-slate">
              This combination isn&apos;t available yet. Try <strong>Software Engineer</strong> at{" "}
              <strong>Intermediate</strong> difficulty — it&apos;s fully available across all interview
              types.
            </div>
          )}

          <button
            onClick={handleStart}
            disabled={!canStart}
            className="w-full rounded-xl bg-amber py-4 text-lg font-bold text-white transition hover:bg-amber-dim disabled:cursor-not-allowed disabled:bg-panel-2 disabled:text-slate"
          >
            Start Interview
          </button>
        </div>
      )}
    </div>
  );
}
