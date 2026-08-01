import { useCallback, useEffect, useState } from "react";
import type { AdminRole } from "@/lib/adminAuth";

interface PermissionsState {
  role: AdminRole | null;
  isAdmin: boolean;
}

/**
 * Client-side role check, backed by app/api/auth/permissions/route.ts
 * (which just exposes the existing requireAdmin() server-side check —
 * no new authorization logic). Returns null role for a signed-out or
 * non-admin user; never throws.
 */
export function usePermissions() {
  const [state, setState] = useState<PermissionsState>({ role: null, isAdmin: false });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/permissions");
      const json = await res.json();

      if (!res.ok || !json.success) {
        setState({ role: null, isAdmin: false });
        return;
      }

      setState({ role: json.role, isAdmin: json.isAdmin });
    } catch {
      setState({ role: null, isAdmin: false });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const hasRole = useCallback(
    (roles: AdminRole[]) => state.role !== null && roles.includes(state.role),
    [state.role]
  );

  return { ...state, loading, hasRole, refetch: load };
}
