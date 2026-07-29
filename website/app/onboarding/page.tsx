"use client";

import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingProgress from "@/components/onboarding/OnboardingProgress";
import StepRoleType from "@/components/onboarding/steps/StepRoleType";
import StepBackground from "@/components/onboarding/steps/StepBackground";
import StepSkills from "@/components/onboarding/steps/StepSkills";
import StepTargetCareer from "@/components/onboarding/steps/StepTargetCareer";
import StepPreferences from "@/components/onboarding/steps/StepPreferences";
import StepSummary from "@/components/onboarding/steps/StepSummary";
import type { OnboardingAnswers } from "@/types/onboarding";

const INITIAL_ANSWERS: OnboardingAnswers = {
  roleType: "",
  education: "",
  experience: "",
  currentSkills: [],
  targetCareer: "",
  dreamCompany: "",
  dreamSalary: "",
  studyTime: "",
  interests: [],
};

export default function OnboardingPage() {
  const { user, loading } = useUser();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<OnboardingAnswers>(INITIAL_ANSWERS);

  function updateAnswers(patch: Partial<OnboardingAnswers>) {
    setAnswers((prev) => ({ ...prev, ...patch }));
  }

  if (loading || !user) {
    return (
      <OnboardingLayout>
        <div className="py-10 text-center text-slate">Loading...</div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout>
      {step <= 5 && <OnboardingProgress step={step} />}

      {step === 1 && (
        <StepRoleType
          answers={answers}
          onChange={updateAnswers}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <StepBackground
          answers={answers}
          onChange={updateAnswers}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <StepSkills
          answers={answers}
          onChange={updateAnswers}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      )}

      {step === 4 && (
        <StepTargetCareer
          answers={answers}
          onChange={updateAnswers}
          onNext={() => setStep(5)}
          onBack={() => setStep(3)}
        />
      )}

      {step === 5 && (
        <StepPreferences
          answers={answers}
          onChange={updateAnswers}
          onNext={() => setStep(6)}
          onBack={() => setStep(4)}
        />
      )}

      {step === 6 && <StepSummary userId={user.id} answers={answers} />}
    </OnboardingLayout>
  );
}
