import LoadingState from "@/components/ui/LoadingState";

/** Shared "AI is working" state — same visual language every feature uses. */
export default function AILoadingState({
  message = "Thinking…",
  className = "",
}: {
  message?: string;
  className?: string;
}) {
  return <LoadingState message={message} className={className} />;
}
