"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

type FeatureCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  /** Seconds of animation-delay so the three cards drift out of phase
   *  with each other instead of moving in lockstep. */
  floatDelay?: number;
};

/**
 * Compact supporting row — previously a heavy, self-contained "mini
 * hero card" (p-6, shadow-lg/2xl, 64px icon, floating "AI" badge,
 * animated bottom accent, hover lift+scale) that read as three
 * separate objects rather than supporting detail under the headline.
 * Same content, much lighter chrome: a thin border, no shadow at rest.
 *
 * Continuously drifts via the CSS animate-card-float animation
 * (globals.css) — kept as a plain CSS `animation`, not a framer-motion
 * `whileHover`/`animate` transform, so it never fights a JS-driven
 * transform for the same property. Hover feedback is deliberately
 * non-transform (border/background/shadow) so it layers on top of the
 * continuous drift instead of conflicting with it.
 */
export default function FeatureCard({
  icon,
  title,
  description,
  floatDelay = 0,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      style={{ animationDelay: `${floatDelay}s` }}
      className="animate-card-float flex items-center gap-4 rounded-2xl border border-bone/10 bg-panel/60 px-4 py-3 transition-all duration-200 hover:border-amber/40 hover:bg-panel hover:shadow-md"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber/10 text-amber">
        {icon}
      </div>

      <div className="min-w-0">
        <h3 className="text-sm font-bold text-bone">{title}</h3>
        <p className="mt-0.5 text-sm leading-6 text-slate">{description}</p>
      </div>
    </motion.div>
  );
}
