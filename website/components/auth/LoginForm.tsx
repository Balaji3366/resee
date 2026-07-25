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
  <div className="w-full max-w-lg rounded-[32px] border border-[#D4AF37]/20 bg-white p-10 shadow-2xl">

    {/* Heading */}

    <div className="mb-8 text-center">

      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0A3B2E] text-3xl">
        ✨
      </div>

      <h2 className="text-4xl font-extrabold text-[#06281F]">
        Welcome Back
      </h2>

      <p className="mt-3 text-gray-600">
        Login to continue your Mentora journey.
      </p>

    </div>

    <form onSubmit={handleLogin} className="space-y-6">

      {/* Email */}

      <div>

        <label className="mb-2 block font-medium text-[#06281F]">
          Email Address
        </label>

        <div className="flex h-14 items-center gap-4 rounded-xl border border-gray-300 bg-white px-4 transition-all duration-200 focus-within:border-[#0A3B2E] focus-within:ring-4 focus-within:ring-[#0A3B2E]/10">

          <Mail size={20} className="text-[#0A3B2E]" />

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent text-[#06281F] placeholder:text-gray-400 outline-none"
          />

        </div>

      </div>

      {/* Password */}

      <div>

        <label className="mb-2 block font-medium text-[#06281F]">
          Password
        </label>

        <div className="flex h-14 items-center gap-4 rounded-xl border border-gray-300 bg-white px-4 transition-all duration-200 focus-within:border-[#0A3B2E] focus-within:ring-4 focus-within:ring-[#0A3B2E]/10">

          <Lock size={20} className="text-[#0A3B2E]" />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent text-[#06281F] placeholder:text-gray-400 outline-none"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff
                size={20}
                className="text-gray-500 hover:text-[#D4AF37]"
              />
            ) : (
              <Eye
                size={20}
                className="text-gray-500 hover:text-[#D4AF37]"
              />
            )}
          </button>

        </div>

      </div>

      {/* Remember */}

      <div className="flex items-center justify-between text-sm">

        <label className="flex items-center gap-2 text-gray-600">

          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="accent-[#0A3B2E]"
          />

          Remember Me

        </label>

        <Link
          href="/forgot-password"
          className="font-semibold text-[#0A3B2E] hover:text-[#D4AF37]"
        >
          Forgot Password?
        </Link>

      </div>

      {/* Login Button */}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-[#0A3B2E] py-4 text-lg font-bold text-white transition hover:bg-[#14532D] disabled:opacity-60"
      >
        {loading ? "Signing In..." : "Login"}
      </button>

      {/* Divider */}

      <div className="flex items-center gap-4">

        <div className="h-px flex-1 bg-gray-300" />

        <span className="text-sm text-gray-500">
          OR
        </span>

        <div className="h-px flex-1 bg-gray-300" />

      </div>

      {/* Google */}

      <GoogleButton />

      {/* Signup */}

      <p className="text-center text-sm text-gray-600">

        Don't have an account?{" "}

        <Link
          href="/signup"
          className="font-bold text-[#0A3B2E] hover:text-[#D4AF37]"
        >
          Create Account
        </Link>

      </p>

    </form>

  </div>
);
}
