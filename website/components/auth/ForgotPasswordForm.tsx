"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email.");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success(
        "Password reset link sent! Please check your email."
      );

      setEmail("");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-6">

      <div className="w-full max-w-md rounded-3xl border border-amber/20 bg-panel p-8 shadow-2xl">

        <div className="mb-8 text-center">

          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber/10">
            <Mail className="h-8 w-8 text-amber" />
          </div>

          <h1 className="font-display text-3xl font-bold text-bone">
            Forgot Password?
          </h1>

          <p className="mt-3 text-slate">
            Enter your registered email and we'll send you a password reset
            link.
          </p>

        </div>

        <form onSubmit={handleReset} className="space-y-6">

          <div>

            <label className="mb-2 block font-medium text-bone">
              Email Address
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-bone/15 px-4 py-3 outline-none transition focus:border-amber focus:ring-2 focus:ring-amber/30"
            />

          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber py-3 font-semibold text-bone transition hover:brightness-110 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>

        </form>

        <Link
          href="/login"
          className="mt-6 flex items-center justify-center gap-2 text-amber transition hover:text-amber"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>

      </div>

    </div>
  );
}