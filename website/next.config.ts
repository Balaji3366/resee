import type { NextConfig } from "next";

// No-nonce CSP (docs/architecture/system-architecture.md's Security section) —
// a nonce-based policy would require every page to opt into dynamic
// rendering app-wide (per Next.js's own CSP guide), which is a much larger
// architectural change than "add security headers" calls for.
//
// Re-verified during the A-M1 auth/CSP QA pass (against
// node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md
// for this Next.js version) rather than assumed: nonces require dynamic
// rendering on every page because Next only injects a nonce during SSR,
// and Next's App Router itself streams inline `<script>` tags for RSC
// payload data on every request — those can't be pre-hashed, so even the
// newer build-time Subresource-Integrity CSP option (experimental.sri,
// which covers external <script src> files) wouldn't let script-src drop
// 'unsafe-inline'. style-src keeps 'unsafe-inline' for the same reason
// applied to CSS: this app uses live `style={{...}}` values throughout
// (progress bars, animation delays, computed gradients) that can't be
// precompiled into static classes either. Tightening either directive
// for real requires the same app-wide dynamic-rendering trade-off, not a
// header change — see the final QA report for what was hardened instead
// (cookie flags, /api/chat validation, rate limiting).
const isDev = process.env.NODE_ENV === "development";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseWsUrl = supabaseUrl.replace(/^https:/, "wss:");

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: ${supabaseUrl};
  font-src 'self';
  connect-src 'self' ${supabaseUrl} ${supabaseWsUrl};
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader.replace(/\s{2,}/g, " ").trim(),
          },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
