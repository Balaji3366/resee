"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingProgress from "@/components/onboarding/OnboardingProgress";
import StepWelcome from "@/components/onboarding/steps/StepWelcome";
import StepUserType from "@/components/onboarding/steps/StepUserType";
import StepGoal from "@/components/onboarding/steps/StepGoal";
import StepTargetCareer from "@/components/onboarding/steps/StepTargetCareer";
import StepSkillLevel from "@/components/onboarding/steps/StepSkillLevel";
import StepGenerating from "@/components/onboarding/steps/StepGenerating";
import type { OnboardingAnswers } from "@/types/onboarding";

const PENDING_GOAL_KEY = "resee:pending-onboarding-goal";

const INITIAL_ANSWERS: OnboardingAnswers = {
  userType: "",
  goal: "",
  targetCareer: "",
  skillLevel: "",
};

export default function OnboardingPage() {
  const { user, loading } = useUser();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<OnboardingAnswers>(INITIAL_ANSWERS);

  useEffect(() => {
    const pendingGoal = window.localStorage.getItem(PENDING_GOAL_KEY);

    if (pendingGoal) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAnswers((prev) => ({ ...prev, goal: pendingGoal }));
      window.localStorage.removeItem(PENDING_GOAL_KEY);
    }
  }, []);

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
      {step >= 2 && step <= 5 && <OnboardingProgress step={step - 1} />}

      {step === 1 && <StepWelcome onNext={() => setStep(2)} />}

      {step === 2 && (
        <StepUserType
          answers={answers}
          onChange={updateAnswers}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <StepGoal
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
        <StepSkillLevel
          answers={answers}
          onChange={updateAnswers}
          onNext={() => setStep(6)}
          onBack={() => setStep(4)}
        />
      )}

      {step === 6 && <StepGenerating userId={user.id} answers={answers} />}
    </OnboardingLayout>
  );
}
