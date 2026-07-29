"use client";

import { motion } from "framer-motion";
import { getPasswordStrength } from "@/lib/passwordStrength";

interface PasswordStrengthMeterProps {
  password: string;
}

const SEGMENT_COLORS = [
  "bg-red-400",
  "bg-red-400",
  "bg-yellow-500",
  "bg-amber",
  "bg-teal",
];

const LABEL_COLORS = [
  "text-red-400",
  "text-red-400",
  "text-yellow-600",
  "text-amber",
  "text-teal",
];

export default function PasswordStrengthMeter({
  password,
}: PasswordStrengthMeterProps) {
  if (!password) return null;

  const { score, label } = getPasswordStrength(password);

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mt-2"
    >
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              i < score ? SEGMENT_COLORS[score] : "bg-panel-2"
            }`}
          />
        ))}
      </div>

      <p className={`mt-1.5 text-xs font-medium ${LABEL_COLORS[score]}`}>
        {label}
      </p>
    </motion.div>
  );
}
