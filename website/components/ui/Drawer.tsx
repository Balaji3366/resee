"use client";

import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export const Drawer = RadixDialog.Root;
export const DrawerTrigger = RadixDialog.Trigger;
export const DrawerClose = RadixDialog.Close;

interface DrawerContentProps {
  children: ReactNode;
  className?: string;
  side?: "left" | "right";
  hideCloseButton?: boolean;
}

const SIDE_STYLES: Record<"left" | "right", string> = {
  right: "right-0 border-l-2 data-[state=closed]:translate-x-full data-[state=open]:translate-x-0",
  left: "left-0 border-r-2 data-[state=closed]:-translate-x-full data-[state=open]:translate-x-0",
};

/**
 * Side-sliding panel — a Dialog variant reusing @radix-ui/react-dialog
 * directly rather than Dialog.tsx's DialogContent, since a drawer is
 * full-height and edge-anchored, not centered. Animates via a plain CSS
 * transition keyed off Radix's `data-state` (not a keyframe animation
 * like Dialog's contentShow/contentHide) since a slide is a single
 * transform change, not a multi-step sequence — this also sidesteps the
 * `animation-fill-mode` revert bug caught earlier in Dialog.tsx.
 */
export function DrawerContent({
  children,
  className = "",
  side = "right",
  hideCloseButton = false,
}: DrawerContentProps) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="radix-overlay fixed inset-0 z-50 bg-bone/40 backdrop-blur-sm" />

      <RadixDialog.Content
        className={`fixed inset-y-0 z-50 flex w-full max-w-sm flex-col border-bone bg-panel p-7 transition-transform duration-[var(--duration-base)] ease-out focus:outline-none ${SIDE_STYLES[side]} ${className}`}
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

export function DrawerHeader({ children }: { children: ReactNode }) {
  return <div className="mb-5 pr-8">{children}</div>;
}

export function DrawerTitle({ children }: { children: ReactNode }) {
  return (
    <RadixDialog.Title className="font-display text-xl font-extrabold text-bone">
      {children}
    </RadixDialog.Title>
  );
}

export function DrawerDescription({ children }: { children: ReactNode }) {
  return (
    <RadixDialog.Description className="mt-2 text-sm text-slate">
      {children}
    </RadixDialog.Description>
  );
}

export function DrawerFooter({ children }: { children: ReactNode }) {
  return <div className="mt-auto flex justify-end gap-3 pt-7">{children}</div>;
}
