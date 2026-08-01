import { toastSuccess, toastError, toastInfo } from "@/lib/toast";

/**
 * Hook-shaped wrapper around lib/toast.ts for callers that prefer
 * destructuring from a hook rather than importing the plain functions
 * directly — both are equally valid, this is just the naming
 * convention Sprint 3's hook inventory asked for.
 */
export function useToast() {
  return { toastSuccess, toastError, toastInfo };
}
