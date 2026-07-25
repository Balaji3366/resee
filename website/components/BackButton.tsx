"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="
        group
        inline-flex
        items-center
        gap-2
        rounded-2xl
        border
        border-[#D4AF37]
        bg-white
        px-5
        py-3
        font-semibold
        text-[#0A3B2E]
        shadow-[0_10px_30px_rgba(10,59,46,0.08)]
        transition-all
        duration-300
        hover:bg-[#0A3B2E]
        hover:text-white
        hover:shadow-[0_18px_40px_rgba(10,59,46,0.18)]
      "
    >
      <ArrowLeft
        size={20}
        className="transition-transform duration-300 group-hover:-translate-x-1"
      />

      Back
    </button>
  );
}