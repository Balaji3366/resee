"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export default function UpdatePasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Password updated successfully!");

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAF8] px-6">
      <div className="w-full max-w-md rounded-3xl border border-[#D4AF37]/20 bg-white p-8 shadow-2xl">

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#0A3B2E]/10">
            <Lock className="h-8 w-8 text-[#0A3B2E]" />
          </div>

          <h1 className="text-3xl font-bold text-[#06281F]">
            Create New Password
          </h1>

          <p className="mt-3 text-gray-600">
            Choose a strong password for your Mentora account.
          </p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-5">

          <div>
            <label className="mb-2 block font-medium text-[#06281F]">
              New Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium text-[#06281F]">
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#D4AF37] py-3 font-semibold text-[#06281F] transition hover:brightness-110 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </button>

        </form>
      </div>
    </div>
  );
}