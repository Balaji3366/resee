import LoginFeatures from "@/components/auth/LoginFeature";
import SignupForm from "@/components/auth/SignUpForm";

export default function SignupPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-ink">

      {/* Background Glow */}

      <div className="absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full bg-amber/20 blur-3xl" />

      <div className="absolute -bottom-40 -right-40 h-[420px] w-[420px] rounded-full bg-amber/20 blur-3xl" />

      {/* Decorative Grid */}

      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Content */}

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-between gap-20 px-6 py-16">

        {/* Left */}

        <div className="hidden flex-1 lg:block">
          <LoginFeatures />
        </div>

        {/* Right */}

        <div className="flex flex-1 justify-center">
          <SignupForm />
        </div>

      </div>

    </main>
  );
}