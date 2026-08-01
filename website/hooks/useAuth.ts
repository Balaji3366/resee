import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase";

/**
 * Wraps the existing useUser() rather than duplicating its
 * onAuthStateChange subscription — adds signOut() and an
 * isAuthenticated boolean. Does not replace useUser; call sites that
 * only need { user, loading } can keep using it directly.
 */
export function useAuth() {
  const { user, loading } = useUser();
  const router = useRouter();

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }, [router]);

  return { user, loading, isAuthenticated: !loading && !!user, signOut };
}
