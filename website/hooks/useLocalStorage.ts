import { useCallback, useEffect, useState } from "react";

/**
 * Generic typed localStorage hook with cross-tab sync via the `storage`
 * event. The 3 existing raw localStorage/sessionStorage usages in this
 * codebase (lib/supabase.ts's "remember me" flag, the onboarding-goal
 * capture, the resume-improvement handoff payload) are not migrated to
 * this in this pass — it's available for new code going forward.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;

    try {
      const raw = window.localStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setStoredValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = next instanceof Function ? next(prev) : next;

        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // Storage full or unavailable (private browsing) — state still
          // updates in-memory, it just won't persist across reloads.
        }

        return resolved;
      });
    },
    [key]
  );

  const removeValue = useCallback(() => {
    window.localStorage.removeItem(key);
    setValue(initialValue);
  }, [key, initialValue]);

  useEffect(() => {
    function handleStorageEvent(event: StorageEvent) {
      if (event.key !== key) return;

      try {
        setValue(event.newValue !== null ? (JSON.parse(event.newValue) as T) : initialValue);
      } catch {
        // Ignore malformed values written by another tab.
      }
    }

    window.addEventListener("storage", handleStorageEvent);
    return () => window.removeEventListener("storage", handleStorageEvent);
  }, [key, initialValue]);

  return [value, setStoredValue, removeValue] as const;
}
