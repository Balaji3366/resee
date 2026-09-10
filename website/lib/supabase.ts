import { createBrowserClient } from "@supabase/ssr";
import { parse, serialize } from "cookie";

const REMEMBER_ME_KEY = "resee-remember-me";

/**
 * Call before supabase.auth.signInWithPassword(). Controls whether the
 * session cookie survives a full browser restart (true, the default) or
 * is cleared the moment the browser closes (false).
 */
export function setRememberMe(remember: boolean) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(REMEMBER_ME_KEY, remember ? "1" : "0");
  } catch {
    // private mode / storage disabled — fall back to persistent default
  }
}

function shouldRemember(): boolean {
  if (typeof window === "undefined") return true;

  try {
    return window.localStorage.getItem(REMEMBER_ME_KEY) !== "0";
  } catch {
    return true;
  }
}

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    // Hardened beyond @supabase/ssr's defaults (path "/", sameSite "lax",
    // no explicit secure flag) — see A-M1 in the auth-QA remediation
    // report for why `secure` is the only flag safely tightenable here.
    // `httpOnly` is deliberately NOT set: this is the BROWSER client, and
    // its `setAll` below writes the cookie via `document.cookie` a few
    // lines down — a cookie written from JavaScript can never be
    // HttpOnly, no matter what's passed here (that's a browser platform
    // rule, not a Supabase limitation). LoginForm/SignUpForm/GoogleButton
    // all call supabase.auth.* directly from client components, so this
    // client must be able to read/write its own session cookie for
    // sign-in, sign-out, and token refresh to keep working. `sameSite:
    // "lax"` (not "strict") is required too — Google OAuth's redirect
    // back to /auth/callback is a top-level cross-site GET, which a
    // "strict" cookie would not be sent on.
    cookieOptions: {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
    cookies: {
      getAll() {
        if (typeof document === "undefined") return [];

        return Object.entries(parse(document.cookie)).map(([name, value]) => ({
          name,
          value: value ?? "",
        }));
      },
      setAll(cookiesToSet) {
        const remember = shouldRemember();

        cookiesToSet.forEach(({ name, value, options }) => {
          const finalOptions = { ...options };

          if (!remember) {
            delete finalOptions.maxAge;
            delete finalOptions.expires;
          }

          document.cookie = serialize(name, value, finalOptions);
        });
      },
    },
  }
);
