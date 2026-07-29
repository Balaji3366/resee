"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { getPasswordStrength } from "@/lib/passwordStrength";
import PasswordStrengthMeter from "@/components/auth/PasswordStrengthMeter";

interface FieldErrors {
  password?: string;
  confirmPassword?: string;
}

export default function UpdatePasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  function validate(): boolean {
    const next: FieldErrors = {};

    if (password.length < 6) {
      next.password = "Password must be at least 6 characters.";
    } else if (getPasswordStrength(password).score < 2) {
      next.password = "Please choose a stronger password.";
    }

    if (password !== confirmPassword) {
      next.confirmPassword = "Passwords do not match.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);

      const { error } = await supabase.auth.updateUser({ password });

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
    <div className="flex min-h-screen items-center justify-center bg-ink px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md rounded-3xl border border-amber/20 bg-panel p-8 shadow-2xl"
      >

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber/10">
            <Lock className="h-8 w-8 text-amber" />
          </div>

          <h1 className="font-display text-3xl font-bold text-bone">
            Create New Password
          </h1>

          <p className="mt-3 text-slate">
            Choose a strong password for your RESEE account.
          </p>
        </div>

        <form onSubmit={handleUpdate} noValidate className="space-y-5">

          <div>
            <label className="mb-2 block font-medium text-bone">
              New Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              placeholder="Enter new password"
              className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${
                errors.password
                  ? "border-red-400 focus:ring-red-100"
                  : "border-bone/15 focus:border-amber focus:ring-amber/30"
              }`}
            />

            <PasswordStrengthMeter password={password} />

            {errors.password && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1.5 text-xs font-medium text-red-400"
              >
                {errors.password}
              </motion.p>
            )}
          </div>

          <div>
            <label className="mb-2 block font-medium text-bone">
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              placeholder="Confirm password"
              className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${
                errors.confirmPassword
                  ? "border-red-400 focus:ring-red-100"
                  : "border-bone/15 focus:border-amber focus:ring-amber/30"
              }`}
            />

            {errors.confirmPassword && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1.5 text-xs font-medium text-red-400"
              >
                {errors.confirmPassword}
              </motion.p>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber py-3 font-semibold text-bone transition hover:brightness-110 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </motion.button>

        </form>
      </motion.div>
    </div>
  );
}
