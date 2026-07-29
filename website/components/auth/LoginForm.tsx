"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye , EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import GoogleButton from "./GoogleButton";


  export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);  
  const [rememberMe, setRememberMe] = useState(false);
  async function handleLogin(e: React.FormEvent) {
  e.preventDefault();

  if (!email || !password) {
    toast.error("Please enter your email and password.");
    return;
  }

  setLoading(true);

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
  <div className="w-full max-w-lg rounded-[32px] border border-amber/20 bg-panel p-10 shadow-2xl">

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

    <form onSubmit={handleLogin} className="space-y-6">

      {/* Email */}

      <div>

        <label className="mb-2 block font-medium text-bone">
          Email Address
        </label>

        <div className="flex h-14 items-center gap-4 rounded-xl border border-bone/15 bg-panel px-4 transition-all duration-200 focus-within:border-amber focus-within:ring-4 focus-within:ring-amber/10">

          <Mail size={20} className="text-amber" />

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent text-bone placeholder:text-slate outline-none"
          />

        </div>

      </div>

      {/* Password */}

      <div>

        <label className="mb-2 block font-medium text-bone">
          Password
        </label>

        <div className="flex h-14 items-center gap-4 rounded-xl border border-bone/15 bg-panel px-4 transition-all duration-200 focus-within:border-amber focus-within:ring-4 focus-within:ring-amber/10">

          <Lock size={20} className="text-amber" />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent text-bone placeholder:text-slate outline-none"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff
                size={20}
                className="text-slate hover:text-amber"
              />
            ) : (
              <Eye
                size={20}
                className="text-slate hover:text-amber"
              />
            )}
          </button>

        </div>

      </div>

      {/* Remember */}

      <div className="flex items-center justify-between text-sm">

        <label className="flex items-center gap-2 text-slate">

          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
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

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-amber py-4 text-lg font-bold text-white transition hover:bg-amber-dim disabled:opacity-60"
      >
        {loading ? "Signing In..." : "Login"}
      </button>

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

        Don't have an account?{" "}

        <Link
          href="/signup"
          className="font-bold text-amber hover:text-amber"
        >
          Create Account
        </Link>

      </p>

    </form>

  </div>
);
}
