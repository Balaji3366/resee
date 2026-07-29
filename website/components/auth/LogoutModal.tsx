"use client";

import { LogOut, ShieldAlert } from "lucide-react";

type LogoutModalProps = {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function LogoutModal({
  open,
  onCancel,
  onConfirm,
}: LogoutModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">

      {/* Click outside to close */}
      <div
        className="absolute inset-0"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-amber/20 bg-panel shadow-[0_30px_80px_rgba(0,0,0,0.35)]">

        {/* Header */}

        <div className="bg-gradient-to-r from-amber to-amber-dim px-8 py-7 text-center">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber shadow-lg">

            <ShieldAlert
              size={38}
              className="text-bone"
            />

          </div>

          <h2 className="font-display mt-5 text-3xl font-bold text-white">
            Logout
          </h2>

          <p className="mt-2 text-sm text-bone/70">
            You're about to sign out of RESEE.
          </p>

        </div>

        {/* Body */}

        <div className="px-8 py-7">

          <p className="text-center leading-7 text-slate">
            Are you sure you want to logout?
            <br />
            You can sign in again anytime.
          </p>

          <div className="mt-8 flex gap-4">

            <button
              onClick={onCancel}
              className="flex-1 rounded-xl border border-bone/15 bg-panel py-3 font-semibold text-bone transition-all hover:border-amber hover:bg-panel"
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-3 font-semibold text-white transition-all hover:bg-red-700"
            >
              <LogOut size={18} />
              Logout
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}