"use client";

import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogClose = RadixDialog.Close;

interface DialogContentProps {
  children: ReactNode;
  className?: string;
  /** Hides the built-in close (X) button — use when the footer already has a Cancel action. */
  hideCloseButton?: boolean;
}

/**
 * Built on @radix-ui/react-dialog — focus trap, Escape-to-close,
 * scroll-lock, and return-focus-to-trigger are all handled by the
 * primitive. Every DialogContent renders a DialogTitle (see
 * DialogHeader) since Radix requires one for screen-reader users, even
 * if visually de-emphasized.
 */
export function DialogContent({
  children,
  className = "",
  hideCloseButton = false,
}: DialogContentProps) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="radix-overlay fixed inset-0 z-50 bg-bone/40 backdrop-blur-sm" />

      <RadixDialog.Content
        className={`radix-content fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border-2 border-bone bg-panel p-7 focus:outline-none ${className}`}
        style={{ boxShadow: "var(--shadow-lg)" }}
      >
        {children}

        {!hideCloseButton && (
          <RadixDialog.Close className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-bone/50 transition hover:bg-panel-2 hover:text-bone">
            <X size={18} />
            <span className="sr-only">Close</span>
          </RadixDialog.Close>
        )}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}

export function DialogHeader({ children }: { children: ReactNode }) {
  return <div className="mb-5 pr-8">{children}</div>;
}

export function DialogTitle({ children }: { children: ReactNode }) {
  return (
    <RadixDialog.Title className="font-display text-xl font-extrabold text-bone">
      {children}
    </RadixDialog.Title>
  );
}

export function DialogDescription({ children }: { children: ReactNode }) {
  return (
    <RadixDialog.Description className="mt-2 text-sm text-slate">
      {children}
    </RadixDialog.Description>
  );
}

export function DialogFooter({ children }: { children: ReactNode }) {
  return <div className="mt-7 flex justify-end gap-3">{children}</div>;
}
