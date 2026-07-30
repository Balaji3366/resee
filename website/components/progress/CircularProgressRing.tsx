"use client";

import { motion } from "framer-motion";

export default function CircularProgressRing({
  percent,
  label,
  sublabel,
  size = 128,
  strokeWidth = 10,
  color = "var(--color-amber)",
}: {
  percent: number;
  label: string;
  sublabel?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-panel-2)"
            strokeWidth={strokeWidth}
          />

          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-2xl font-extrabold text-bone">{clamped}%</span>
        </div>
      </div>

      <div className="mt-3 text-center">
        <p className="text-sm font-semibold text-bone">{label}</p>
        {sublabel && <p className="text-xs text-slate">{sublabel}</p>}
      </div>
    </div>
  );
}
