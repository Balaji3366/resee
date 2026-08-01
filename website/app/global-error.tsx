"use client";

import { useEffect } from "react";

// Deliberately NOT importing components/ui/** here — global-error.tsx
// replaces the entire root layout (including app/globals.css's own
// provider tree) when a fatal error occurs above it, so it renders its
// own minimal <html>/<body> per Next.js convention and can't rely on
// anything the root layout would normally provide.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Fatal application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff8f0",
          color: "#231a14",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: 420,
            textAlign: "center",
            border: "2px solid #231a14",
            borderRadius: 24,
            padding: 32,
          }}
        >
          <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Something went wrong</h1>
          <p style={{ marginTop: 8, color: "#6b6058", fontSize: 14 }}>
            The application hit an unexpected error. Try reloading the page.
          </p>

          <button
            onClick={reset}
            style={{
              marginTop: 20,
              border: "none",
              borderRadius: 9999,
              background: "#ff6b4a",
              color: "#fff8f0",
              padding: "10px 24px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
