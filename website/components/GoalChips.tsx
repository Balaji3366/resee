"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GOALS } from "@/constants/goals";

export default function GoalChips() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  function selectGoal(goalId: string) {
    setSelected(goalId);
    router.push(`/signup?goal=${goalId}`);
  }

  return (
    <section id="goals" className="bg-panel py-28">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-4xl px-6 text-center"
      >

        <h2 className="font-display text-4xl font-extrabold text-bone md:text-5xl">
          What do you want to achieve?
        </h2>

        <div className="mt-12 flex flex-wrap justify-center gap-4">
          {GOALS.map((goal) => (
            <button
              key={goal.id}
              onClick={() => selectGoal(goal.id)}
              className={`inline-flex items-center gap-2 rounded-full border px-6 py-3 font-medium transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                selected === goal.id
                  ? "border-amber bg-amber text-white shadow-lg"
                  : "border-amber/20 bg-ink text-bone hover:border-amber/50"
              }`}
            >
              <span>{goal.icon}</span>
              {goal.label}
            </button>
          ))}
        </div>

      </motion.div>
    </section>
  );
}
