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
    cookies: {
      getAll() {
        if (typeof document === "undefined") return [];

        return Object.entries(parse(document.cookie)).map(
          ([name, value]) => ({ name, value: value ?? "" })
        );
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
