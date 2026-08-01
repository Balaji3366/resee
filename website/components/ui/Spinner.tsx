type SpinnerSize = "sm" | "md" | "lg";

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  /** Accessible label for screen readers — the spinner itself is decorative. */
  label?: string;
}

const SIZE_PX: Record<SpinnerSize, number> = { sm: 16, md: 24, lg: 36 };

export default function Spinner({ size = "md", className = "", label = "Loading" }: SpinnerProps) {
  const px = SIZE_PX[size];

  return (
    <span role="status" className={`inline-block ${className}`}>
      <svg
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill="none"
        className="animate-spin"
        style={{ animationDuration: "0.8s" }}
      >
        <circle cx="12" cy="12" r="10" stroke="rgba(35,26,20,0.15)" strokeWidth="3" />
        <path
          d="M22 12a10 10 0 0 0-10-10"
          stroke="var(--color-amber)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}
