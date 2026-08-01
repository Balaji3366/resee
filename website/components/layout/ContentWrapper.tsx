import type { ReactNode } from "react";

type MaxWidth = "3xl" | "5xl" | "6xl" | "7xl" | "full";

interface ContentWrapperProps {
  children: ReactNode;
  maxWidth?: MaxWidth;
  className?: string;
}

const MAX_WIDTH_CLASSES: Record<MaxWidth, string> = {
  "3xl": "max-w-3xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
  full: "max-w-full",
};

/** Plain max-width + padding wrapper — the primitive PageContainer builds on. */
export default function ContentWrapper({
  children,
  maxWidth = "7xl",
  className = "",
}: ContentWrapperProps) {
  return (
    <div className={`mx-auto px-6 py-8 md:px-8 ${MAX_WIDTH_CLASSES[maxWidth]} ${className}`}>
      {children}
    </div>
  );
}
