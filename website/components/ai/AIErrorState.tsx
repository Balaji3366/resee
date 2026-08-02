import ErrorState from "@/components/ui/ErrorState";
import AICreditExhaustedState from "./AICreditExhaustedState";
import type { AIError } from "@/types/ai";

/**
 * Maps every AIErrorCode runAIRequest() can return to the right shared
 * state — so a feature route never has to reinvent "what do I show for
 * rate_limited vs. no_credits vs. provider_error." `no_credits` gets its
 * own dedicated state (AICreditExhaustedState); everything else reuses
 * the platform's existing ErrorState with error-specific copy.
 */
export default function AIErrorState({
  error,
  onRetry,
  className = "",
}: {
  error: AIError;
  onRetry?: () => void;
  className?: string;
}) {
  if (error.code === "no_credits") {
    return <AICreditExhaustedState message={error.message} className={className} />;
  }

  const titleByCode: Record<string, string> = {
    rate_limited: "Slow down a little",
    invalid_request: "Couldn't process that",
    provider_error: "AI service unavailable",
    parse_error: "Unexpected AI response",
    unknown: "Something went wrong",
  };

  return (
    <ErrorState
      title={titleByCode[error.code] ?? "Something went wrong"}
      message={error.message}
      onRetry={error.retryable ? onRetry : undefined}
      className={className}
    />
  );
}
