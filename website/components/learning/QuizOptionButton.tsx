"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

interface QuizOptionButtonProps {
  label: string;
  selected: boolean;
  state?: "default" | "correct" | "incorrect";
  onClick: () => void;
  disabled?: boolean;
}

export default function QuizOptionButton({
  label,
  selected,
  state = "default",
  onClick,
  disabled,
}: QuizOptionButtonProps) {
  const stateClasses =
    state === "correct"
      ? "border-teal bg-teal-dim/10"
      : state === "incorrect"
      ? "border-red-400 bg-red-400/10"
      : selected
      ? "border-amber bg-panel-2/40"
      : "border-bone/15 hover:border-amber/50";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { y: -2 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={`flex w-full items-center gap-3 rounded-xl border px-5 py-4 text-left transition-colors disabled:cursor-not-allowed ${stateClasses}`}
    >
      {state === "correct" && (
        <CheckCircle2 size={20} className="shrink-0 text-teal" />
      )}

      {state === "incorrect" && (
        <XCircle size={20} className="shrink-0 text-red-400" />
      )}

      {state === "default" && (
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
            selected ? "border-amber bg-amber" : "border-bone/25"
          }`}
        >
          {selected && <span className="h-2 w-2 rounded-full bg-white" />}
        </span>
      )}

      <span className="text-bone">{label}</span>
    </motion.button>
  );
}
