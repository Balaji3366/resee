import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  // Coral fill — primary CTA.
  primary: "bg-amber text-ink hover:scale-[1.03]",
  // Solid violet fill — secondary emphasis (mirrors the sidebar's active-nav treatment).
  secondary: "bg-amber-dim text-ink hover:scale-[1.03]",
  // Ink outline that inverts to filled ink on hover, per the design handoff's button pattern.
  outline: "border-2 border-bone bg-transparent text-bone hover:bg-bone hover:text-ink",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm gap-1.5",
  md: "px-6 py-3 text-base gap-2",
  lg: "px-8 py-4 text-lg gap-2.5",
};

/**
 * Fully pill-shaped button per the ReSee v5 design handoff — every button
 * across the redesign is `border-radius:9999px`, never a soft rounded-rect.
 * forwardRef so this composes with Radix's `asChild`/`Slot` pattern (e.g.
 * `<Dialog.Trigger asChild><Button>...</Button></Dialog.Trigger>`).
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, variant = "primary", size = "md", className = "", ...buttonProps },
  ref
) {
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]} ${className}`}
      {...buttonProps}
    >
      {children}
    </button>
  );
});

export default Button;
