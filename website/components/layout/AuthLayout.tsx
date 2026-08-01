import type { ReactNode } from "react";
import LoginFeatures from "@/components/auth/LoginFeature";

interface AuthLayoutProps {
  /** The form (or Suspense-wrapped form) for the right column. */
  children: ReactNode;
  /** A non-visual side-effect component rendered before the decorative layers (e.g. GoalCapture on signup). */
  beforeContent?: ReactNode;
}

/**
 * Extracted from app/login/page.tsx and app/signup/page.tsx, which were
 * byte-for-byte identical shells (background glow, decorative grid,
 * split two-column: hidden-on-mobile LoginFeatures + centered form).
 * app/forgot-password/page.tsx and app/updat-password/page.tsx use a
 * different (simpler, centered-card) shape and are not migrated onto
 * this — only login/signup share this exact structure.
 */
export default function AuthLayout({ children, beforeContent }: AuthLayoutProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-ink">
      {beforeContent}

      {/* Background Glow */}
      <div className="pointer-events-none absolute right-0 top-1/4 h-[32rem] w-[32rem] rounded-full bg-amber/10 blur-[140px]" />

      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Content */}
      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-between gap-20 px-6 py-16">
        <div className="hidden flex-1 lg:block">
          <LoginFeatures />
        </div>

        <div className="flex flex-1 justify-center">{children}</div>
      </div>
    </main>
  );
}
