"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-amber/20 bg-ink/95 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">

        {/* Logo */}

        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-3"
        >
          <Image
            src="/images/resee-logo.png"
            alt="RESEE Logo"
            width={48}
            height={48}
            priority
            className="rounded-xl"
          />

          <div className="flex flex-col items-start">
            <h1 className="font-display text-3xl font-extrabold text-amber">
              RESEE
            </h1>

            <span className="text-xs uppercase tracking-[0.25em] text-slate">
              See Your Future
            </span>
          </div>
        </button>

      
        {/* Right Side */}

        {!user ? (
          <div className="hidden items-center gap-4 lg:flex">
            <button
              onClick={() => router.push("/login")}
              className="rounded-xl border border-amber px-5 py-2 font-semibold text-amber transition hover:bg-amber hover:text-bone"
            >
              Login
            </button>

            <button
              onClick={() => router.push("/signup")}
              className="rounded-xl bg-amber px-6 py-2 font-semibold text-bone transition hover:brightness-110"
            >
              Get Started
            </button>
          </div>
        ) : (
          <div className="relative" ref={menuRef}>

            <button
              onClick={() => setOpen((prev) => !prev)}
              className="flex items-center gap-3 rounded-xl border border-amber/30 bg-amber px-4 py-2 transition hover:border-amber"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber font-bold text-bone">
                {fullName.charAt(0).toUpperCase()}
              </div>

              <div className="hidden text-left lg:block">
                <p className="text-sm font-bold text-white">
                  {fullName}
                </p>

                <p className="text-xs text-slate">
                  Welcome Back
                </p>
              </div>
            </button>

            {open && (
              <div className="absolute right-0 mt-3 w-60 overflow-hidden rounded-2xl border border-amber/20 bg-panel shadow-2xl">

                <button
                  onClick={() => {
                    setOpen(false);
                    router.push("/dashboard");
                  }}
                  className="block w-full px-5 py-3 text-left text-bone transition hover:bg-ink"
                >
                  Dashboard
                </button>

                <button
                  onClick={() => {
                    setOpen(false);
                    router.push("/resume-history");
                  }}
                  className="block w-full px-5 py-3 text-left text-bone transition hover:bg-ink"
                >
                  Resume History
                </button>

                <button
                  onClick={() => {
                    setOpen(false);
                    router.push("/documents");
                  }}
                  className="block w-full px-5 py-3 text-left text-bone transition hover:bg-ink"
                >
                  Documents
                </button>

                <hr />

                <button
                  onClick={() => {
                    setOpen(false);
                    setLogoutOpen(true);
                  }}
                  className="block w-full px-5 py-3 text-left text-bone transition hover:bg-ink"
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