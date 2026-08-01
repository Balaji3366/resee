"use client";

import { useState } from "react";
import type { ReactNode } from "react";

export interface SidebarRenderProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export interface NavbarRenderProps {
  onMenuClick: () => void;
}

interface AppShellProps {
  renderSidebar: (props: SidebarRenderProps) => ReactNode;
  renderNavbar: (props: NavbarRenderProps) => ReactNode;
  children: ReactNode;
}

/**
 * `app/(dashboard)/layout.tsx` and `app/admin/(panel)/layout.tsx` were a
 * 100% duplicate (identical JSX/classes, differing only in which
 * Sidebar/Navbar they imported) — this is that shell, parameterized.
 * Sidebar/Navbar components themselves (DashboardSidebar/Navbar,
 * AdminSidebar/Navbar) are untouched; only the shell around them moved
 * here. Render-prop shape (not a plain `sidebar`/`navbar` ReactNode
 * prop) because both existing sidebar/navbar pairs share the exact same
 * `{mobileOpen, onMobileClose}` / `{onMenuClick}` prop contract, and
 * this shell — not each page — owns the shared mobile-nav-open state.
 */
export default function AppShell({ renderSidebar, renderNavbar, children }: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <section className="min-h-screen bg-ink pt-2 pb-16">
      <div className="mx-auto max-w-[96rem] px-6">
        <div className="flex gap-6 lg:gap-8">
          {renderSidebar({
            mobileOpen: mobileNavOpen,
            onMobileClose: () => setMobileNavOpen(false),
          })}

          <div className="min-w-0 flex-1">
            {renderNavbar({ onMenuClick: () => setMobileNavOpen(true) })}
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
