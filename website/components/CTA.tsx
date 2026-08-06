"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function CTA() {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-amber to-amber-dim py-24">
      {/* Same gradient as the section's own background, oversized and
          nudged very slowly via animate-cta-drift (globals.css) — the
          static base gradient above is untouched, so reduced-motion
          users see an identical, motionless result. */}
      <div
        aria-hidden="true"
        className="animate-cta-drift pointer-events-none absolute -inset-[15%] bg-gradient-to-br from-amber to-amber-dim"
      />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.15),transparent_60%)]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto max-w-3xl px-6 text-center"
      >
        <h2 className="font-display text-4xl font-extrabold text-white md:text-5xl">
          Your future starts today.
        </h2>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push("/signup")}
          className="mt-10 rounded-xl bg-white px-10 py-4 font-semibold text-amber shadow-xl transition hover:shadow-2xl"
        >
          Start Your Journey
        </motion.button>

        <p className="mt-6 text-sm text-white/80">
          Everything you need to learn,
          <br />
          practice, and get hired.
        </p>
      </motion.div>
    </section>
  );
}
