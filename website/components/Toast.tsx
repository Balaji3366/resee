"use client";

import { useEffect } from "react";

type Props = {
  message: string;
  show: boolean;
  onClose: () => void;
};

export default function Toast({
  message,
  show,
  onClose,
}: Props) {
  useEffect(() => {
    if (!show) return;

    const timer = setTimeout(() => {
      onClose();
    }, 2500);

    return () => clearTimeout(timer);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed right-6 top-6 z-50 rounded-xl bg-emerald-600 px-5 py-3 text-white shadow-2xl">
      {message}
    </div>
  );
}