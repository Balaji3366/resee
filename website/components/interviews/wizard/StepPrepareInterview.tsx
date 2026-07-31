"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const MESSAGES = [
  "Preparing Interview...",
  "Selecting Questions...",
  "Creating Interview Session...",
  "Almost Ready...",
];

const MIN_DISPLAY_MS = 2200;
const MESSAGE_INTERVAL_MS = 1000;

export default function StepPrepareInterview({ setSlug }: { setSlug: string }) {
  const router = useRouter();
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const messageTimer = setInterval(() => {
      setMessageIndex((i) => (i + 1) % MESSAGES.length);
    }, MESSAGE_INTERVAL_MS);

    const redirectTimer = setTimeout(() => {
      router.replace(`/interviews/${setSlug}`);
    }, MIN_DISPLAY_MS);

    return () => {
      clearInterval(messageTimer);
      clearTimeout(redirectTimer);
    };
  }, [setSlug, router]);

  return (
    <div className="py-10 text-center">
      <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-amber/30 border-t-amber-dim" />

      <h2 className="font-display text-2xl font-bold text-bone">Getting things ready...</h2>

      <AnimatePresence mode="wait">
        <motion.p
          key={messageIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="mt-3 text-slate"
        >
          {MESSAGES[messageIndex]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
