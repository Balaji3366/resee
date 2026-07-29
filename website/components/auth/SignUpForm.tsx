"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import GoogleButton from "./GoogleButton";

export default function SignupForm() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    if (!fullName || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(
      "Account created successfully! Please check your email to verify your account."
    );

    router.push("/login");
  }

  return (
  <div className="w-full max-w-lg rounded-[32px] border border-amber/20 bg-panel p-10 shadow-2xl">

    {/* Heading */}

    <div className="mb-8 text-center">
   
      <h2 className="font-display text-4xl font-extrabold text-bone">
        Create your account
      </h2>

      <p className="mt-3 text-slate">
        Start your AI-powered career journey.
      </p>

    </div>

    <form onSubmit={handleSignup} className="space-y-5">

      {/* Full Name */}

      <div>

        <label className="mb-2 block font-medium text-bone">
          Full Name
        </label>

        <div className="flex h-14 items-center gap-4 rounded-xl border border-bone/15 px-4 transition focus-within:border-amber">

          <User size={20} className="text-amber" />

          <input
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-transparent text-bone placeholder:text-slate outline-none"
          />

        </div>

      </div>

      {/* Email */}

      <div>

        <label className="mb-2 block font-medium text-bone">
          Email Address
        </label>

        <div className="flex h-14 items-center gap-4 rounded-xl border border-bone/15 px-4 transition focus-within:border-amber">

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

        <div className="flex h-14 items-center gap-4 rounded-xl border border-bone/15 px-4 transition focus-within:border-amber">

          <Lock size={20} className="text-amber" />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
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

      {/* Confirm Password */}

      <div>

        <label className="mb-2 block font-medium text-bone">
          Confirm Password
        </label>

        <div className="flex h-14 items-center gap-4 rounded-xl border border-bone/15 px-4 transition focus-within:border-amber">

          <Lock size={20} className="text-amber" />

          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-transparent text-bone placeholder:text-slate outline-none"
          />

          <button
            type="button"
            onClick={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
          >
            {showConfirmPassword ? (
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

      {/* Signup Button */}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-amber py-4 text-lg font-bold text-white transition hover:bg-amber-dim disabled:opacity-60"
      >
        {loading ? "Creating Account..." : "Create Account"}
      </button>

      {/* Divider */}

      <div className="flex items-center gap-4">

        <div className="h-px flex-1 bg-panel-2" />

        <span className="text-sm text-slate">
          OR
        </span>

        <div className="h-px flex-1 bg-panel-2" />

      </div>

      <GoogleButton />

      <p className="text-center text-sm text-slate">

        Already a RESEE member?{" "}

        <Link
          href="/login"
          className="font-bold text-amber hover:text-amber"
        >
          Sign In
        </Link>

      </p>

    </form>

  </div>
);
}