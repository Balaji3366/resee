import { Sparkles } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

/**
 * The shared "out of AI credits for this period" state — every future
 * AI feature hits the same runAIRequest() `no_credits` error and should
 * show the same recognizable state, not a one-off message per feature.
 */
export default function AICreditExhaustedState({
  message = "You're out of AI credits for this period. Credits refresh at the start of your next billing cycle.",
  className = "",
}: {
  message?: string;
  className?: string;
}) {
  return (
    <EmptyState
      icon={<Sparkles size={22} />}
      title="Out of AI credits"
      message={message}
      actions={[{ label: "View plans", href: "/settings" }]}
      className={className}
    />
  );
}
