"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";

interface LoadingContextValue {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextValue | null>(null);

/**
 * A small global loading-state context — e.g. for a future
 * route-transition indicator shown while navigating between pages.
 * Distinct from hooks/useLoading.ts, which is per-component local state;
 * this is the one shared/global instance, mounted once in app/layout.tsx.
 */
export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);

  const setLoading = useCallback((loading: boolean) => setIsLoading(loading), []);

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading }}>{children}</LoadingContext.Provider>
  );
}

export function useGlobalLoading(): LoadingContextValue {
  const context = useContext(LoadingContext);

  if (!context) {
    throw new Error("useGlobalLoading must be used within a LoadingProvider");
  }

  return context;
}
