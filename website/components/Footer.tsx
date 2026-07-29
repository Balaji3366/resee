"use client";

import { useRouter } from "next/navigation";

export default function Footer() {
  const router = useRouter();

  return (
    <footer id="about" className="border-t border-amber/10 bg-ink">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-6 py-10 md:flex-row md:justify-between">

        <button
          onClick={() => router.push("/")}
          className="font-display text-xl font-extrabold text-amber"
        >
          RESEE
        </button>

        <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate">
          <button
            onClick={() =>
              document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })
            }
            className="transition hover:text-bone"
          >
            About
          </button>

          <button
            onClick={() =>
              document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" })
            }
            className="transition hover:text-bone"
          >
            Pricing
          </button>

          <button className="transition hover:text-bone">
            Privacy
          </button>

          <button className="transition hover:text-bone">
            Terms
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <button className="rounded-full border border-amber/20 p-2 transition hover:border-amber hover:text-amber">
            🌐
          </button>

          <button className="rounded-full border border-amber/20 p-2 transition hover:border-amber hover:text-amber">
            💼
          </button>

          <button className="rounded-full border border-amber/20 p-2 transition hover:border-amber hover:text-amber">
            🐦
          </button>
        </div>

      </div>

      <p className="border-t border-amber/10 py-5 text-center text-xs text-slate">
        © ReSee
      </p>
    </footer>
  );
}
