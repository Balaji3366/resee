"use client";

import * as RadixDropdownMenu from "@radix-ui/react-dropdown-menu";
import type { ReactNode } from "react";

export const DropdownMenu = RadixDropdownMenu.Root;
export const DropdownMenuTrigger = RadixDropdownMenu.Trigger;

interface DropdownMenuContentProps {
  children: ReactNode;
  align?: "start" | "center" | "end";
}

/**
 * Built on @radix-ui/react-dropdown-menu — for action menus ("Edit /
 * Archive / Delete"), distinct from Select.tsx (form value selection).
 * Full keyboard nav (arrow keys, typeahead, Escape) handled by the
 * primitive.
 */
export function DropdownMenuContent({ children, align = "end" }: DropdownMenuContentProps) {
  return (
    <RadixDropdownMenu.Portal>
      <RadixDropdownMenu.Content
        align={align}
        sideOffset={6}
        className="radix-content z-50 min-w-[180px] rounded-[16px] border-2 border-bone bg-panel p-1.5 focus:outline-none"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        {children}
      </RadixDropdownMenu.Content>
    </RadixDropdownMenu.Portal>
  );
}

interface DropdownMenuItemProps {
  children: ReactNode;
  onSelect?: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

export function DropdownMenuItem({
  children,
  onSelect,
  destructive = false,
  disabled = false,
}: DropdownMenuItemProps) {
  return (
    <RadixDropdownMenu.Item
      onSelect={onSelect}
      disabled={disabled}
      className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium outline-none transition-colors data-[highlighted]:bg-amber/10 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-40 ${
        destructive ? "text-red-600" : "text-bone"
      }`}
    >
      {children}
    </RadixDropdownMenu.Item>
  );
}

export const DropdownMenuSeparator = () => (
  <RadixDropdownMenu.Separator className="my-1.5 h-px bg-bone/10" />
);
