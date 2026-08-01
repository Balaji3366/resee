"use client";

import { useEffect } from "react";
import Card from "@/components/ui/Card";
import ErrorState from "@/components/ui/ErrorState";
import { logError } from "@/lib/logging/errorLogger";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logError(error, { digest: error.digest, boundary: "route" });
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-6">
      <Card className="w-full max-w-md p-8">
        <ErrorState onRetry={reset} />
      </Card>
    </main>
  );
}
