import type { ReactNode } from "react";
import ContentWrapper from "@/components/layout/ContentWrapper";
import SectionHeader from "@/components/layout/SectionHeader";
import BackButton from "@/components/BackButton";

interface PageContainerProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  showBackButton?: boolean;
  maxWidth?: "3xl" | "5xl" | "6xl" | "7xl" | "full";
  className?: string;
}

/**
 * `components/PageLayout.tsx`'s real replacement — that file declares a
 * `variant` prop it never actually uses, and hardcodes a dark background
 * that no longer makes sense post-redesign. This is `ContentWrapper` +
 * an optional back button + an optional `SectionHeader` slot.
 * `PageLayout.tsx` stays in place and working (its one consumer,
 * app/documents/page.tsx, is a business-module file and isn't migrated
 * in this pass) — this is what new standalone pages should use instead.
 */
export default function PageContainer({
  children,
  title,
  subtitle,
  action,
  showBackButton = true,
  maxWidth = "7xl",
  className = "",
}: PageContainerProps) {
  return (
    <ContentWrapper maxWidth={maxWidth} className={className}>
      {showBackButton && (
        <div className="mb-6">
          <BackButton />
        </div>
      )}

      {title && <SectionHeader title={title} subtitle={subtitle} action={action} />}

      {children}
    </ContentWrapper>
  );
}
