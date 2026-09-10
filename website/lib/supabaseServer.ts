import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cookie-authenticated Supabase client for use inside API route handlers.
 * Session refresh already happens in proxy.ts for every protected route,
 * so this never needs to write cookies back.
 */
export async function getServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // setAll is a no-op here (see comment above), so this never writes
      // a cookie itself — kept for consistency with lib/supabase.ts and
      // proxy.ts (the client that actually does write refreshed session
      // cookies) so all three agree if that ever changes. See A-M1.
      cookieOptions: {
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // no-op, see comment above
        },
      },
    }
  );
}
