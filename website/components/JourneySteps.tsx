"use client";

import { motion } from "framer-motion";
import { BookOpen, Target, Mic, Trophy, ArrowRight } from "lucide-react";

const STEPS = [
  { icon: BookOpen, label: "Learn" },
  { icon: Target, label: "Practice" },
  { icon: Mic, label: "Mock Interview" },
  { icon: Trophy, label: "Get Hired" },
];

export default function JourneySteps() {
  return (
    <section className="bg-ink py-28">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-5xl px-6 text-center"
      >

        <h2 className="font-display text-4xl font-extrabold text-bone md:text-5xl">
          We&apos;ll guide you until you achieve it.
        </h2>

        <div className="mt-16 flex flex-col items-center justify-center gap-6 md:flex-row">
          {STEPS.map((step, i) => {
            const Icon = step.icon;

            return (
              <div key={step.label} className="flex flex-col items-center gap-6 md:flex-row">

                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-panel">
                    <Icon className="text-amber" size={28} />
                  </div>

                  <span className="font-semibold text-bone">
                    {step.label}
                  </span>
                </div>

                {i < STEPS.length - 1 && (
                  <ArrowRight className="hidden text-amber/40 md:block" size={22} />
                )}

              </div>
            );
          })}
        </div>

      </motion.div>
    </section>
  );
}
