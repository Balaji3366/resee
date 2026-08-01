import { Suspense } from "react";
import SignupForm from "@/components/auth/SignUpForm";
import GoalCapture from "@/components/auth/GoalCapture";
import AuthLayout from "@/components/layout/AuthLayout";

export default function SignupPage() {
  return (
    <AuthLayout
      beforeContent={
        <Suspense fallback={null}>
          <GoalCapture />
        </Suspense>
      }
    >
      <SignupForm />
    </AuthLayout>
  );
}
