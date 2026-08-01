"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { useAuth } from "@/hooks/useAuth";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Wraps hooks/useAuth.ts in Context so multiple components stop
 * independently subscribing to supabase.auth.onAuthStateChange — found
 * duplicated between hooks/useUser.ts and components/Navbar.tsx.
 * Navbar.tsx's own subscription is not migrated to this in this pass;
 * this just stops the pattern from spreading further. Mounted once in
 * app/layout.tsx. Also serves as the "Session" state Sprint 4 asked
 * for — Supabase's session is the session, so it isn't duplicated as a
 * second context.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }

  return context;
}
