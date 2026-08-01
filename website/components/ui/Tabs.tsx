"use client";

import * as RadixTabs from "@radix-ui/react-tabs";
import type { ReactNode } from "react";

export const Tabs = RadixTabs.Root;
export const TabsContent = RadixTabs.Content;

interface TabItem {
  value: string;
  label: string;
}

interface TabsListProps {
  items: TabItem[];
}

/**
 * Built on @radix-ui/react-tabs — arrow-key navigation between tabs,
 * Home/End, and automatic activation handled by the primitive.
 */
export function TabsList({ items }: TabsListProps) {
  return (
    <RadixTabs.List
      className="flex gap-1 rounded-full border-2 border-bone bg-panel p-1.5"
      aria-label="Tabs"
    >
      {items.map((item) => (
        <RadixTabs.Trigger
          key={item.value}
          value={item.value}
          className="flex-1 rounded-full px-4 py-2 text-sm font-bold text-bone/60 transition-colors data-[state=active]:bg-amber-dim data-[state=active]:text-ink"
        >
          {item.label}
        </RadixTabs.Trigger>
      ))}
    </RadixTabs.List>
  );
}

export function TabPanel({ children }: { children: ReactNode }) {
  return <div className="mt-5">{children}</div>;
}
