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
  <div className="w-full max-w-lg rounded-[32px] border border-[#D4AF37]/20 bg-white p-10 shadow-2xl">

    {/* Heading */}

    <div className="mb-8 text-center">
   
      <h2 className="text-4xl font-extrabold text-[#06281F]">
        Create your account
      </h2>

      <p className="mt-3 text-gray-600">
        Start your AI-powered career journey.
      </p>

    </div>

    <form onSubmit={handleSignup} className="space-y-5">

      {/* Full Name */}

      <div>

        <label className="mb-2 block font-medium text-[#06281F]">
          Full Name
        </label>

        <div className="flex h-14 items-center gap-4 rounded-xl border border-gray-300 px-4 transition focus-within:border-[#D4AF37]">

          <User size={20} className="text-[#0A3B2E]" />

          <input
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-transparent text-[#06281F] placeholder:text-gray-400 outline-none"
          />

        </div>

      </div>

      {/* Email */}

      <div>

        <label className="mb-2 block font-medium text-[#06281F]">
          Email Address
        </label>

        <div className="flex h-14 items-center gap-4 rounded-xl border border-gray-300 px-4 transition focus-within:border-[#D4AF37]">

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

        <div className="flex h-14 items-center gap-4 rounded-xl border border-gray-300 px-4 transition focus-within:border-[#D4AF37]">

          <Lock size={20} className="text-[#0A3B2E]" />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
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

      {/* Confirm Password */}

      <div>

        <label className="mb-2 block font-medium text-[#06281F]">
          Confirm Password
        </label>

        <div className="flex h-14 items-center gap-4 rounded-xl border border-gray-300 px-4 transition focus-within:border-[#D4AF37]">

          <Lock size={20} className="text-[#0A3B2E]" />

          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-transparent text-[#06281F] placeholder:text-gray-400 outline-none"
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

      {/* Signup Button */}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-[#0A3B2E] py-4 text-lg font-bold text-white transition hover:bg-[#14532D] disabled:opacity-60"
      >
        {loading ? "Creating Account..." : "Create Account"}
      </button>

      {/* Divider */}

      <div className="flex items-center gap-4">

        <div className="h-px flex-1 bg-gray-300" />

        <span className="text-sm text-gray-500">
          OR
        </span>

        <div className="h-px flex-1 bg-gray-300" />

      </div>

      <GoogleButton />

      <p className="text-center text-sm text-gray-600">

        Already a RESEE member?{" "}

        <Link
          href="/login"
          className="font-bold text-[#0A3B2E] hover:text-[#D4AF37]"
        >
          Sign In
        </Link>

      </p>

    </form>

  </div>
);
}