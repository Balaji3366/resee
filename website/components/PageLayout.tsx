"use client";

import { ReactNode } from "react";
import BackButton from "./BackButton";

type PageLayoutProps = {
  children: ReactNode;
  variant?: "light" | "dark";
};

export default function PageLayout({
  children,
  variant = "light",
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-7xl px-8 py-8">

        <div className="mb-8">
          <BackButton />
        </div>

        {children}

      </div>
    </div>
  );
}