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
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#D4AF37]/20 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.35)]">

        {/* Header */}

        <div className="bg-gradient-to-r from-[#0A3B2E] to-[#14532D] px-8 py-7 text-center">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#D4AF37] shadow-lg">

            <ShieldAlert
              size={38}
              className="text-[#06281F]"
            />

          </div>

          <h2 className="mt-5 text-3xl font-bold text-white">
            Logout
          </h2>

          <p className="mt-2 text-sm text-gray-200">
            You're about to sign out of Mentora.
          </p>

        </div>

        {/* Body */}

        <div className="px-8 py-7">

          <p className="text-center leading-7 text-gray-600">
            Are you sure you want to logout?
            <br />
            You can sign in again anytime.
          </p>

          <div className="mt-8 flex gap-4">

            <button
              onClick={onCancel}
              className="flex-1 rounded-xl border border-gray-300 bg-white py-3 font-semibold text-[#06281F] transition-all hover:border-[#0A3B2E] hover:bg-gray-50"
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