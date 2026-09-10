"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { isValidEmail } from "@/lib/authValidation";
import { getPasswordStrength } from "@/lib/passwordStrength";
import PasswordStrengthMeter from "./PasswordStrengthMeter";
import GoogleButton from "./GoogleButton";

interface FieldErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const RESEND_COOLDOWN_SECONDS = 30;

export default function SignupForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  function validate(): boolean {
    const next: FieldErrors = {};

    if (!fullName.trim()) {
      next.fullName = "Full name is required.";
    }

    if (!email.trim()) {
      next.email = "Email is required.";
    } else if (!isValidEmail(email)) {
      next.email = "Enter a valid email address.";
    }

    if (!password) {
      next.password = "Password is required.";
    } else if (getPasswordStrength(password).score < 2) {
      next.password = "Please choose a stronger password.";
    }

    if (!confirmPassword) {
      next.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      next.confirmPassword = "Passwords do not match.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setPendingEmail(email);
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
  }

  async function handleResend() {
    if (!pendingEmail || resendCooldown > 0) return;

    setResending(true);

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: pendingEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setResending(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Verification email sent again.");
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
  }

  return (
    <div className="w-full max-w-lg rounded-[32px] border border-amber/20 bg-panel p-10 shadow-2xl">
      <AnimatePresence mode="wait">
        {pendingEmail ? (
          <motion.div
            key="pending"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber/10">
              <MailCheck className="h-8 w-8 text-amber" />
            </div>

            <h2 className="font-display text-3xl font-extrabold text-bone">Check your email</h2>

            <p className="mt-3 text-slate">We sent a verification link to</p>

            <p className="font-semibold text-bone">{pendingEmail}</p>

            <p className="mt-4 text-sm text-slate">
              Click the link in that email to activate your account.
            </p>

            <motion.button
              whileHover={{ scale: resendCooldown > 0 ? 1 : 1.02 }}
              whileTap={{ scale: resendCooldown > 0 ? 1 : 0.98 }}
              onClick={handleResend}
              disabled={resendCooldown > 0 || resending}
              className="focus-ring mt-8 w-full rounded-xl bg-amber py-4 text-lg font-bold text-white transition hover:bg-amber-dim disabled:opacity-60"
            >
              {resendCooldown > 0
                ? `Resend available in ${resendCooldown}s`
                : resending
                  ? "Sending..."
                  : "Resend Verification Email"}
            </motion.button>

            <button
              onClick={() => {
                setPendingEmail(null);
                setResendCooldown(0);
              }}
              className="focus-ring mt-4 text-sm font-semibold text-amber hover:text-amber"
            >
              Use a different email
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            {/* Heading */}

            <div className="mb-8 text-center">
              <h2 className="font-display text-4xl font-extrabold text-bone">
                Create your account
              </h2>

              <p className="mt-3 text-slate">Start your AI-powered career journey.</p>
            </div>

            <form onSubmit={handleSignup} noValidate className="space-y-5">
              {/* Full Name */}

              <div>
                <label htmlFor="signup-name" className="mb-2 block font-medium text-bone">
                  Full Name
                </label>

                <div
                  className={`focus-ring flex h-14 items-center gap-4 rounded-xl border px-4 transition ${
                    errors.fullName ? "border-red-400" : "border-bone/15 focus-within:border-amber"
                  }`}
                >
                  <User size={20} className="text-amber" />

                  <input
                    id="signup-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Enter your full name"
                    value={fullName}
                    aria-invalid={!!errors.fullName}
                    aria-describedby={errors.fullName ? "signup-name-error" : undefined}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
                    }}
                    className="w-full bg-transparent text-bone placeholder:text-slate outline-none"
                  />
                </div>

                {errors.fullName && (
                  <motion.p
                    id="signup-name-error"
                    role="alert"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1.5 text-xs font-medium text-red-400"
                  >
                    {errors.fullName}
                  </motion.p>
                )}
              </div>

              {/* Email */}

              <div>
                <label htmlFor="signup-email" className="mb-2 block font-medium text-bone">
                  Email Address
                </label>

                <div
                  className={`focus-ring flex h-14 items-center gap-4 rounded-xl border px-4 transition ${
                    errors.email ? "border-red-400" : "border-bone/15 focus-within:border-amber"
                  }`}
                >
                  <Mail size={20} className="text-amber" />

                  <input
                    id="signup-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    value={email}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "signup-email-error" : undefined}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    className="w-full bg-transparent text-bone placeholder:text-slate outline-none"
                  />
                </div>

                {errors.email && (
                  <motion.p
                    id="signup-email-error"
                    role="alert"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1.5 text-xs font-medium text-red-400"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </div>

              {/* Password */}

              <div>
                <label htmlFor="signup-password" className="mb-2 block font-medium text-bone">
                  Password
                </label>

                <div
                  className={`focus-ring flex h-14 items-center gap-4 rounded-xl border px-4 transition ${
                    errors.password ? "border-red-400" : "border-bone/15 focus-within:border-amber"
                  }`}
                >
                  <Lock size={20} className="text-amber" />

                  <input
                    id="signup-password"
                    name="new-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Create a password"
                    value={password}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "signup-password-error" : undefined}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    className="w-full bg-transparent text-bone placeholder:text-slate outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="focus-ring rounded"
                  >
                    {showPassword ? (
                      <EyeOff size={20} className="text-slate hover:text-amber" />
                    ) : (
                      <Eye size={20} className="text-slate hover:text-amber" />
                    )}
                  </button>
                </div>

                <PasswordStrengthMeter password={password} />

                {errors.password && (
                  <motion.p
                    id="signup-password-error"
                    role="alert"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1.5 text-xs font-medium text-red-400"
                  >
                    {errors.password}
                  </motion.p>
                )}
              </div>

              {/* Confirm Password */}

              <div>
                <label
                  htmlFor="signup-confirm-password"
                  className="mb-2 block font-medium text-bone"
                >
                  Confirm Password
                </label>

                <div
                  className={`focus-ring flex h-14 items-center gap-4 rounded-xl border px-4 transition ${
                    errors.confirmPassword
                      ? "border-red-400"
                      : "border-bone/15 focus-within:border-amber"
                  }`}
                >
                  <Lock size={20} className="text-amber" />

                  <input
                    id="signup-confirm-password"
                    name="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={
                      errors.confirmPassword ? "signup-confirm-password-error" : undefined
                    }
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword)
                        setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                    }}
                    className="w-full bg-transparent text-bone placeholder:text-slate outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    className="focus-ring rounded"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} className="text-slate hover:text-amber" />
                    ) : (
                      <Eye size={20} className="text-slate hover:text-amber" />
                    )}
                  </button>
                </div>

                {errors.confirmPassword && (
                  <motion.p
                    id="signup-confirm-password-error"
                    role="alert"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1.5 text-xs font-medium text-red-400"
                  >
                    {errors.confirmPassword}
                  </motion.p>
                )}
              </div>

              {/* Signup Button */}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="focus-ring w-full rounded-xl bg-amber py-4 text-lg font-bold text-white transition hover:bg-amber-dim disabled:opacity-60"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </motion.button>

              {/* Divider */}

              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-panel-2" />

                <span className="text-sm text-slate">OR</span>

                <div className="h-px flex-1 bg-panel-2" />
              </div>

              <GoogleButton />

              <p className="text-center text-sm text-slate">
                Already a RESEE member?{" "}
                <Link href="/login" className="focus-ring font-bold text-amber hover:text-amber">
                  Sign In
                </Link>
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
