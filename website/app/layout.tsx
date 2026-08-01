import type { Metadata } from "next";
import { Hanken_Grotesk, Schibsted_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { FeatureFlagsProvider } from "@/components/providers/FeatureFlagsProvider";
import { LoadingProvider } from "@/components/providers/LoadingProvider";

// ReSee v5 "Campus-to-Career" redesign fonts — see
// Design baseline recreation priority/design_handoff_v5_redesign/README.md
const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const schibstedGrotesk = Schibsted_Grotesk({
  variable: "--font-schibsted-grotesk",
  weight: ["500", "600", "700", "800"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RESEE",
  description: "AI Learning Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${hankenGrotesk.variable} ${schibstedGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <FeatureFlagsProvider>
            <LoadingProvider>
              <TooltipProvider>{children}</TooltipProvider>
            </LoadingProvider>
          </FeatureFlagsProvider>
        </AuthProvider>

        <Toaster
          richColors
          position="top-center"
          closeButton
          duration={2200}
          offset={24}
          toastOptions={{
            classNames: {
              toast: "!rounded-2xl !border-2 !border-bone !bg-panel !text-bone !font-sans",
              title: "!font-bold",
              actionButton: "!rounded-full !bg-amber !text-ink",
              cancelButton: "!rounded-full !bg-panel-2 !text-bone",
            },
          }}
        />
      </body>
    </html>
  );
}
