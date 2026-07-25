"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

type FeatureCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
};

export default function FeatureCard({
  icon,
  title,
  description,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{
        y: -8,
        scale: 1.02,
      }}
      className="group relative overflow-hidden rounded-3xl border border-[#D4AF37]/20 bg-white p-6 shadow-lg transition-all duration-300 hover:border-[#D4AF37] hover:shadow-2xl"
    >
      {/* Gold Glow */}

      <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/5 via-transparent to-[#0A3B2E]/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative flex items-start gap-5">

        {/* Icon */}

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0A3B2E]/10 text-3xl transition-all duration-300 group-hover:bg-[#0A3B2E] group-hover:scale-110">

          <span className="transition duration-300 group-hover:scale-110">
            {icon}
          </span>

        </div>

        {/* Content */}

        <div className="flex-1">

          <div className="flex items-center justify-between">

            <h3 className="text-xl font-bold text-[#06281F]">
              {title}
            </h3>

            <span className="rounded-full bg-[#D4AF37]/15 px-3 py-1 text-xs font-bold text-[#B8860B]">
              AI
            </span>

          </div>

          <p className="mt-3 leading-7 text-gray-600">
            {description}
          </p>

        </div>

      </div>

      {/* Bottom Accent */}

      <div className="mt-5 h-1 w-0 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#0A3B2E] transition-all duration-500 group-hover:w-full" />

    </motion.div>
  );
}