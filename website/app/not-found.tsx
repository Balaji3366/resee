import Link from "next/link";
import { Compass } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-6">
      <Card className="w-full max-w-md p-8">
        <EmptyState
          icon={<Compass size={26} />}
          title="Page not found"
          message="The page you're looking for doesn't exist or may have moved."
        />

        <Link href="/dashboard" className="mt-6 block">
          <Button variant="primary" className="w-full">
            Back to Dashboard
          </Button>
        </Link>
      </Card>
    </main>
  );
}
