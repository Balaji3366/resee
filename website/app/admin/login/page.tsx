"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Enter your email and password.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    router.push("/admin");
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-ink px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md rounded-[32px] border border-amber/20 bg-panel p-10 shadow-2xl"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber">
            <ShieldCheck size={28} className="text-white" />
          </div>

          <h1 className="font-display text-3xl font-extrabold text-bone">Admin Login</h1>

          <p className="mt-2 text-slate">Restricted to authorized administrators.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="flex h-14 items-center gap-3 rounded-xl border border-bone/15 bg-panel px-4 transition-all duration-200 focus-within:border-amber focus-within:ring-4 focus-within:ring-amber/10">
            <Mail size={20} className="text-amber" />
            <input
              type="email"
              placeholder="Admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent text-bone placeholder:text-slate outline-none"
            />
          </div>

          <div className="flex h-14 items-center gap-3 rounded-xl border border-bone/15 bg-panel px-4 transition-all duration-200 focus-within:border-amber focus-within:ring-4 focus-within:ring-amber/10">
            <Lock size={20} className="text-amber" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent text-bone placeholder:text-slate outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-amber py-4 text-lg font-bold text-white transition hover:bg-amber-dim disabled:opacity-60"
          >
            {loading ? "Signing In..." : "Login"}
          </button>
        </form>
      </motion.div>
    </section>
  );
}
