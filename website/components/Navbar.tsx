"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import LogoutModal from "@/components/auth/LogoutModal";

export default function Navbar() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        setOpen(false);
        router.replace("/");
        router.refresh();
        return;
      }

      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  async function handleLogout() {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error(error);
        return;
      }

      setOpen(false);
      setUser(null);

      router.replace("/");

      setTimeout(() => {
        router.refresh();
      }, 100);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  const fullName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#D4AF37]/20 bg-[#06281F]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">

        {/* Logo */}

        <button
          onClick={() => router.push("/")}
          className="flex flex-col items-start"
        >
          <h1 className="text-3xl font-extrabold text-[#D4AF37]">
            Mentora
          </h1>

          <span className="text-xs uppercase tracking-[0.25em] text-gray-300">
            AI Career Mentor
          </span>
        </button>

        {/* Navigation */}

        <div className="hidden items-center gap-8 lg:flex">
          <a
            href="#features"
            className="text-gray-200 transition hover:text-[#D4AF37]"
          >
            Features
          </a>

          <a
            href="#plans"
            className="text-gray-200 transition hover:text-[#D4AF37]"
          >
            Pricing
          </a>

          {user && (
            <>
              <button
                onClick={() => router.push("/dashboard")}
                className="text-gray-200 transition hover:text-[#D4AF37]"
              >
                Dashboard
              </button>

              <button
                onClick={() => router.push("/documents")}
                className="text-gray-200 transition hover:text-[#D4AF37]"
              >
                Documents
              </button>
            </>
          )}
        </div>

        {/* Right Side */}

        {!user ? (
          <div className="hidden items-center gap-4 lg:flex">
            <button
              onClick={() => router.push("/login")}
              className="rounded-xl border border-[#D4AF37] px-5 py-2 font-semibold text-[#D4AF37] transition hover:bg-[#D4AF37] hover:text-[#06281F]"
            >
              Login
            </button>

            <button
              onClick={() => router.push("/signup")}
              className="rounded-xl bg-[#D4AF37] px-6 py-2 font-semibold text-[#06281F] transition hover:brightness-110"
            >
              Get Started
            </button>
          </div>
        ) : (
          <div className="relative" ref={menuRef}>

            <button
              onClick={() => setOpen((prev) => !prev)}
              className="flex items-center gap-3 rounded-xl border border-[#D4AF37]/30 bg-[#0A3B2E] px-4 py-2 transition hover:border-[#D4AF37]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4AF37] font-bold text-[#06281F]">
                {fullName.charAt(0).toUpperCase()}
              </div>

              <div className="hidden text-left lg:block">
                <p className="text-sm font-bold text-white">
                  {fullName}
                </p>

                <p className="text-xs text-gray-300">
                  Welcome Back
                </p>
              </div>
            </button>

            {open && (
              <div className="absolute right-0 mt-3 w-60 overflow-hidden rounded-2xl border border-[#D4AF37]/20 bg-white shadow-2xl">

                <button
                  onClick={() => {
                    setOpen(false);
                    router.push("/dashboard");
                  }}
                  className="block w-full px-5 py-3 text-left text-[#06281F] transition hover:bg-[#F8FAF8]"
                >
                  Dashboard
                </button>

                <button
                  onClick={() => {
                    setOpen(false);
                    router.push("/resume-history");
                  }}
                  className="block w-full px-5 py-3 text-left text-[#06281F] transition hover:bg-[#F8FAF8]"
                >
                  Resume History
                </button>

                <button
                  onClick={() => {
                    setOpen(false);
                    router.push("/documents");
                  }}
                  className="block w-full px-5 py-3 text-left text-[#06281F] transition hover:bg-[#F8FAF8]"
                >
                  Documents
                </button>

                <hr />

                <button
                  onClick={() => {
                    setOpen(false);
                    setLogoutOpen(true);
                  }}
                  className="block w-full px-5 py-3 text-left text-[#06281F] transition hover:bg-[#F8FAF8]"
                >
                  Logout
                </button>

              </div>
            )}
          </div>
        )}
      </div>
      <LogoutModal
      open={logoutOpen}
      onCancel={() => setLogoutOpen(false)}
      onConfirm={async () => {
        setLogoutOpen(false);
        await handleLogout();
      }}
    />
    </header>
  );
}