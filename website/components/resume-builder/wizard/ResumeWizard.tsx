"use client";

import { useEffect, useRef, useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import ResumeWizardProgress from "./ResumeWizardProgress";
import StepUserType from "./StepUserType";
import StepPersonalInfo from "./StepPersonalInfo";
import StepEducation from "./StepEducation";
import StepExperience from "./StepExperience";
import StepProjects from "./StepProjects";
import StepSkills from "./StepSkills";
import StepCertifications from "./StepCertifications";
import StepGenerate from "./StepGenerate";
import { emptyResumeContent } from "@/types/resume-builder";
import type { ResumeContent } from "@/types/resume-builder";

const TOTAL_STEPS = 8;

export default function ResumeWizard({
  mode,
  resumeId,
  initialContent,
}: {
  mode: "create" | "edit";
  resumeId?: string;
  initialContent?: ResumeContent;
}) {
  const { data: profile } = useProfile();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<ResumeContent>(() => initialContent ?? emptyResumeContent());
  const seededRef = useRef(mode === "edit");

  useEffect(() => {
    if (!seededRef.current && profile?.userType) {
      seededRef.current = true;
      const mapped = profile.userType === "professional" ? "experienced" : "fresher";
      setAnswers((prev) => ({ ...prev, userType: mapped }));
    }
  }, [profile]);

  function updateAnswers(patch: Partial<ResumeContent>) {
    setAnswers((prev) => ({ ...prev, ...patch }));
  }

  return (
    <div className="rounded-3xl border border-amber/20 bg-panel p-8 shadow-md">
      {step <= TOTAL_STEPS - 1 && <ResumeWizardProgress step={step} total={TOTAL_STEPS - 1} />}

      {step === 1 && (
        <StepUserType answers={answers} onChange={updateAnswers} onNext={() => setStep(2)} />
      )}

      {step === 2 && (
        <StepPersonalInfo
          answers={answers}
          onChange={updateAnswers}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <StepEducation
          answers={answers}
          onChange={updateAnswers}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      )}

      {step === 4 && (
        <StepExperience
          answers={answers}
          onChange={updateAnswers}
          onNext={() => setStep(5)}
          onBack={() => setStep(3)}
        />
      )}

      {step === 5 && (
        <StepProjects
          answers={answers}
          onChange={updateAnswers}
          onNext={() => setStep(6)}
          onBack={() => setStep(4)}
        />
      )}

      {step === 6 && (
        <StepSkills
          answers={answers}
          onChange={updateAnswers}
          onNext={() => setStep(7)}
          onBack={() => setStep(5)}
        />
      )}

      {step === 7 && (
        <StepCertifications
          answers={answers}
          onChange={updateAnswers}
          onNext={() => setStep(8)}
          onBack={() => setStep(6)}
        />
      )}

      {step === 8 && <StepGenerate mode={mode} resumeId={resumeId} answers={answers} />}
    </div>
  );
}
