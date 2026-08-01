import { toast as sonnerToast } from "sonner";

/**
 * Thin wrapper around sonner (already installed, already mounted via
 * <Toaster> in app/layout.tsx, already used in ~18 files) — Sprint 2
 * standardizes new code on this instead of building a second toast
 * system. The legacy components/Toast.tsx (one call site,
 * app/resume/improved/page.tsx) is not migrated in this pass.
 */
export const toastSuccess = (message: string) => sonnerToast.success(message);
export const toastError = (message: string) => sonnerToast.error(message);
export const toastInfo = (message: string) => sonnerToast.message(message);
