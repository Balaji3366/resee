interface ProgressRingProps {
  /** 0-100. */
  value: number;
  size?: number;
  strokeWidth?: number;
  /** Ring fill color — defaults to the track-token-aware "currentColor" pattern via a CSS color value. */
  color?: string;
  trackColor?: string;
  children?: React.ReactNode;
}

/**
 * The circular SVG gauge used across the ReSee v5 design handoff (Landing
 * hero stat, Dashboard's Career Health Score, Progress's Overall
 * Progress) — same stroke-dasharray/stroke-dashoffset technique at
 * different radii. `children` renders centered inside the ring (typically
 * the score number).
 */
export default function ProgressRing({
  value,
  size = 160,
  strokeWidth = 12,
  color = "var(--color-amber)",
  trackColor = "rgba(35,26,20,0.08)",
  children,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, value));
  const dashOffset = circumference * (1 - clamped / 100);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>

      {children && (
        <div className="absolute inset-0 flex items-center justify-center">{children}</div>
      )}
    </div>
  );
}
