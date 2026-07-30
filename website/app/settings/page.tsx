import Link from "next/link";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";

export default function SettingsPage() {
  return (
    <OnboardingLayout>
      <h2 className="font-display text-3xl font-extrabold text-bone">
        Settings
      </h2>

      <p className="mt-3 text-slate">
        Manage your career profile.
      </p>

      <Link
        href="/onboarding?edit=true"
        className="mt-8 flex w-full items-center justify-center rounded-xl bg-amber py-4 text-lg font-bold text-white transition hover:bg-amber-dim"
      >
        Edit Career Profile
      </Link>
    </OnboardingLayout>
  );
}
