"use client";

import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function GoogleButton() {
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast.error(error.message);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 font-medium text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D4AF37] hover:shadow-lg"
    >
      <img
        src="/icons/google.png"
        alt="Google"
        className="h-9 w-9 object-contain"
        draggable={false}
      />

      <span>Continue with Google</span>
    </button>
  );
}