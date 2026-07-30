"use client";

import { motion } from "framer-motion";

interface SelectableCardProps {
  icon?: string;
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
}

export default function SelectableCard({
  icon,
  label,
  description,
  selected,
  onClick,
}: SelectableCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full rounded-xl border px-6 py-5 text-left transition-colors ${
        selected
          ? "border-amber bg-panel-2/40"
          : "border-bone/15 hover:border-amber/50"
      }`}
    >
      <div className="flex items-center gap-3">
        {icon && <span className="text-2xl">{icon}</span>}

        <div>
          <p className="text-lg font-bold text-bone">{label}</p>

          {description && (
            <p className="mt-1 text-sm text-slate">{description}</p>
          )}
        </div>
      </div>
    </motion.button>
  );
}
