import Spinner from "@/components/ui/Spinner";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

/**
 * Centered spinner + message for a whole section/page while data loads —
 * distinct from Skeleton (shape-matching content placeholder, used when
 * you already know the target layout) and Spinner (the bare primitive
 * this composes).
 */
export default function LoadingState({ message = "Loading…", className = "" }: LoadingStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-16 text-center ${className}`}
    >
      <Spinner size="lg" />
      <p className="text-sm text-slate">{message}</p>
    </div>
  );
}
