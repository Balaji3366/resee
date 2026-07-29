"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function CTA() {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-amber to-amber-dim py-32">

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
          Start Free Now
        </motion.button>

        <p className="mt-5 text-sm text-white/80">
          No credit card required.
        </p>

      </motion.div>

    </section>
  );
}
