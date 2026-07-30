"use client";

import { motion } from "framer-motion";
import StepFooter from "./StepFooter";

export default function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <h2 className="font-display text-3xl font-extrabold text-bone">
        Welcome to ReSee 👋
      </h2>

      <p className="mt-3 text-slate">
        Let&apos;s build your personalised career journey.
      </p>

      <StepFooter onNext={onNext} nextLabel="Continue" />
    </motion.div>
  );
}
