"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { TARGET_CAREER_SUGGESTIONS } from "@/constants/onboarding";
import type { OnboardingAnswers } from "@/types/onboarding";
import StepFooter from "./StepFooter";

const KNOWN_SUGGESTIONS = TARGET_CAREER_SUGGESTIONS.filter((s) => s !== "Other");

export default function StepTargetCareer({
  answers,
  onChange,
  onNext,
  onBack,
}: {
  answers: OnboardingAnswers;
  onChange: (patch: Partial<OnboardingAnswers>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [search, setSearch] = useState("");
  const [showCustom, setShowCustom] = useState(
    answers.targetCareer !== "" && !KNOWN_SUGGESTIONS.includes(answers.targetCareer)
  );

  const filtered = KNOWN_SUGGESTIONS.filter((s) =>
    s.toLowerCase().includes(search.toLowerCase())
  );

  function selectSuggestion(suggestion: string) {
    if (suggestion === "Other") {
      setShowCustom(true);
      onChange({ targetCareer: "" });
    } else {
      setShowCustom(false);
      onChange({ targetCareer: suggestion });
    }
  }

  return (
    <div>
      <h2 className="font-display text-3xl font-extrabold text-bone">
        Which career are you targeting?
      </h2>

      <p className="mt-3 text-slate">
        Search for a role, or tell us your own.
      </p>

      <div className="mt-8 flex h-14 items-center gap-3 rounded-xl border border-bone/15 px-4 transition focus-within:border-amber">
        <Search size={18} className="text-amber" />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search careers..."
          className="w-full bg-transparent text-bone placeholder:text-slate outline-none"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {filtered.map((suggestion) => (
          <motion.button
            key={suggestion}
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => selectSuggestion(suggestion)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              answers.targetCareer === suggestion
                ? "border-amber bg-amber text-white"
                : "border-bone/15 text-slate hover:border-amber hover:text-bone"
            }`}
          >
            {suggestion}
          </motion.button>
        ))}

        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={() => selectSuggestion("Other")}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
            showCustom
              ? "border-amber bg-amber text-white"
              : "border-bone/15 text-slate hover:border-amber hover:text-bone"
          }`}
        >
          Other
        </motion.button>
      </div>

      {showCustom && (
        <motion.input
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          type="text"
          value={answers.targetCareer}
          onChange={(e) => onChange({ targetCareer: e.target.value })}
          placeholder="Enter your target career"
          className="mt-4 flex h-14 w-full items-center rounded-xl border border-bone/15 px-4 text-bone placeholder:text-slate outline-none transition focus:border-amber"
        />
      )}

      <StepFooter
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!answers.targetCareer.trim()}
      />
    </div>
  );
}
