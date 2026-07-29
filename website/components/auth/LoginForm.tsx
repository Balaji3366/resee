"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase, setRememberMe } from "@/lib/supabase";
import { isValidEmail } from "@/lib/authValidation";
import GoogleButton from "./GoogleButton";

interface FieldErrors {
  email?: string;
  password?: string;
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMeChecked] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    const error = searchParams.get("error");

    if (error) {
      toast.error(error);
    }
  }, [searchParams]);

  function validate(): boolean {
    const next: FieldErrors = {};

    if (!email.trim()) {
      next.email = "Email is required.";
    } else if (!isValidEmail(email)) {
      next.email = "Enter a valid email address.";
    }

    if (!password) {
      next.password = "Password is required.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setRememberMe(rememberMe);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Login successful!");
    router.push("/dashboard");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-lg rounded-[32px] border border-amber/20 bg-panel p-10 shadow-2xl"
    >

      {/* Heading */}

      <div className="mb-8 text-center">

        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber text-3xl">
          ✨
        </div>

        <h2 className="font-display text-4xl font-extrabold text-bone">
          Welcome Back
        </h2>

        <p className="mt-3 text-slate">
          Login to continue your RESEE journey.
        </p>

      </div>

      <form onSubmit={handleLogin} noValidate className="space-y-6">

        {/* Email */}

        <div>

          <label className="mb-2 block font-medium text-bone">
            Email Address
          </label>

          <div
            className={`flex h-14 items-center gap-4 rounded-xl border bg-panel px-4 transition-all duration-200 focus-within:ring-4 ${
              errors.email
                ? "border-red-400 focus-within:ring-red-100"
                : "border-bone/15 focus-within:border-amber focus-within:ring-amber/10"
            }`}
          >

            <Mail size={20} className="text-amber" />

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              className="w-full bg-transparent text-bone placeholder:text-slate outline-none"
            />

          </div>

          {errors.email && (
            <motion.p
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

          <label className="mb-2 block font-medium text-bone">
            Password
          </label>

          <div
            className={`flex h-14 items-center gap-4 rounded-xl border bg-panel px-4 transition-all duration-200 focus-within:ring-4 ${
              errors.password
                ? "border-red-400 focus-within:ring-red-100"
                : "border-bone/15 focus-within:border-amber focus-within:ring-amber/10"
            }`}
          >

            <Lock size={20} className="text-amber" />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              className="w-full bg-transparent text-bone placeholder:text-slate outline-none"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={20} className="text-slate hover:text-amber" />
              ) : (
                <Eye size={20} className="text-slate hover:text-amber" />
              )}
            </button>

          </div>

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

        {/* Remember */}

        <div className="flex items-center justify-between text-sm">

          <label className="flex items-center gap-2 text-slate">

            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMeChecked(e.target.checked)}
              className="accent-amber"
            />

            Remember Me

          </label>

          <Link
            href="/forgot-password"
            className="font-semibold text-amber hover:text-amber"
          >
            Forgot Password?
          </Link>

        </div>

        {/* Login Button */}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-amber py-4 text-lg font-bold text-white transition hover:bg-amber-dim disabled:opacity-60"
        >
          {loading ? "Signing In..." : "Login"}
        </motion.button>

        {/* Divider */}

        <div className="flex items-center gap-4">

          <div className="h-px flex-1 bg-panel-2" />

          <span className="text-sm text-slate">
            OR
          </span>

          <div className="h-px flex-1 bg-panel-2" />

        </div>

        {/* Google */}

        <GoogleButton />

        {/* Signup */}

        <p className="text-center text-sm text-slate">

          Don&apos;t have an account?{" "}

          <Link
            href="/signup"
            className="font-bold text-amber hover:text-amber"
          >
            Create Account
          </Link>

        </p>

      </form>

    </motion.div>
  );
}
