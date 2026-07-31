"use client";

import { useMemo, useState } from "react";
import { useInterviewRoles } from "@/hooks/useInterviewRoles";
import { useInterviewCategories } from "@/hooks/useInterviewCategories";
import { useInterviewSets } from "@/hooks/useInterviewSets";
import ResumeWizardProgress from "@/components/resume-builder/wizard/ResumeWizardProgress";
import StepSelectCareer from "./StepSelectCareer";
import StepSelectExperience from "./StepSelectExperience";
import StepChooseType from "./StepChooseType";
import StepPrepareInterview from "./StepPrepareInterview";
import type { InterviewExperienceLevel } from "@/types/interview";

const TOTAL_STEPS = 4;

export default function InterviewWizard() {
  const { data: roles } = useInterviewRoles();
  const { data: categories } = useInterviewCategories();
  const { data: sets } = useInterviewSets();

  const [step, setStep] = useState(1);
  const [roleSlug, setRoleSlug] = useState<string | null>(null);
  const [experienceLevel, setExperienceLevel] = useState<InterviewExperienceLevel | null>(null);
  const [categorySlug, setCategorySlug] = useState<string | null>(null);

  const resolvedSlug = useMemo(() => {
    if (!sets || !roleSlug || !experienceLevel || !categorySlug) return null;

    const match = sets.find(
      (s) =>
        s.role.slug === roleSlug &&
        s.experienceLevel === experienceLevel &&
        s.category.slug === categorySlug &&
        s.isAvailable
    );

    return match?.slug ?? null;
  }, [sets, roleSlug, experienceLevel, categorySlug]);

  const loading = !roles || !categories || !sets;

  if (loading) {
    return <div className="h-96 animate-pulse rounded-3xl border border-amber/20 bg-panel" />;
  }

  return (
    <div className="rounded-3xl border border-amber/20 bg-panel p-8 shadow-md">
      {step <= TOTAL_STEPS - 1 && <ResumeWizardProgress step={step} total={TOTAL_STEPS - 1} />}

      {step === 1 && (
        <StepSelectCareer
          roles={roles}
          sets={sets}
          roleSlug={roleSlug}
          onSelect={(slug) => {
            setRoleSlug(slug);
            setExperienceLevel(null);
            setCategorySlug(null);
          }}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && roleSlug && (
        <StepSelectExperience
          sets={sets}
          roleSlug={roleSlug}
          experienceLevel={experienceLevel}
          onSelect={(level) => {
            setExperienceLevel(level);
            setCategorySlug(null);
          }}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && roleSlug && experienceLevel && (
        <StepChooseType
          categories={categories}
          sets={sets}
          roleSlug={roleSlug}
          experienceLevel={experienceLevel}
          categorySlug={categorySlug}
          onSelect={setCategorySlug}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      )}

      {step === 4 &&
        (resolvedSlug ? (
          <StepPrepareInterview setSlug={resolvedSlug} />
        ) : (
          <div className="py-10 text-center">
            <p className="text-slate">
              This combination isn&apos;t available yet. Try Software Engineer at the Fresher level —
              it&apos;s fully available across all interview types.
            </p>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="mt-6 rounded-xl bg-amber px-6 py-3 font-semibold text-white transition hover:bg-amber-dim"
            >
              Start Over
            </button>
          </div>
        ))}
    </div>
  );
}
