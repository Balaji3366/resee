"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

type BackButtonProps = {
  variant?: "light" | "dark";
};

export default function BackButton({
  variant = "light",
}: BackButtonProps) {
  const router = useRouter();

  const isDark = variant === "dark";

  return (
    <button
      onClick={() => router.back()}
      className={`group inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-semibold transition-all duration-300 ${
        isDark
          ? "border border-white/20 bg-panel/10 text-white backdrop-blur-md hover:bg-panel hover:text-amber"
          : "border border-amber bg-panel text-amber shadow-[0_10px_30px_rgba(10,59,46,0.08)] hover:bg-amber hover:text-white hover:shadow-[0_18px_40px_rgba(10,59,46,0.18)]"
      }`}
    >
      <ArrowLeft
        size={20}
        className="transition-transform duration-300 group-hover:-translate-x-1"
      />

      Back
    </button>
  );
}