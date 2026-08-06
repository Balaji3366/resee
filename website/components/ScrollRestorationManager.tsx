"use client";

import { useEffect } from "react";

/**
 * Disables the browser's native "auto" scroll restoration, site-wide.
 *
 * Root cause of the back-navigation scroll-jump bug: the App Router's
 * client-side navigation — including router.back() in BackButton.tsx,
 * which is a thin wrapper around the native window.history.back() (per
 * Next.js's own docs: "router.back(): Navigate back to the previous
 * route in the browser's history stack") — never triggers a real
 * document reload. It stays on the same document and drives routing
 * through the History API's pushState/popstate.
 *
 * The browser's default `history.scrollRestoration = "auto"` was
 * designed for full-document (server) navigations, where the browser
 * itself swaps documents and can cleanly restore each document's own
 * scroll offset. For same-document, pushState-driven SPA routing like
 * Next.js's, this native mechanism is well known (across every SPA
 * router — Next.js, React Router, Vue Router) to race the app's own
 * render: the browser applies its own scroll-restoration offset to
 * the still-visible outgoing page for a frame before the new route's
 * content swaps in, producing exactly the "jump to a stale scroll
 * position, then navigate away" flash this fixes.
 *
 * Next.js already manages its own scroll behavior for forward
 * navigation (new routes scroll to the top by default — see
 * https://nextjs.org/docs/app/api-reference/functions/use-router#disabling-scroll-to-top).
 * Setting scrollRestoration to "manual" here only stops the browser's
 * competing native mechanism from also intervening on top of that; it
 * does not change any navigation behavior this app relies on, since
 * nothing else in the codebase reads or depends on native scroll
 * restoration.
 */
export default function ScrollRestorationManager() {
  useEffect(() => {
    if (typeof window === "undefined" || !("scrollRestoration" in window.history)) return;

    const original = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    return () => {
      window.history.scrollRestoration = original;
    };
  }, []);

  return null;
}
