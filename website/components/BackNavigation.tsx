import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Subtle "back to parent section" link for detail/sub-pages across the
 * dashboard (Practice topic → Practice, Learning course → Learning, etc).
 * Distinct from components/BackButton.tsx, which is a large pill button
 * that does router.back() for public/legacy pages — this is a plain,
 * explicit-destination link matching the pattern already used across the
 * app (Link + ArrowLeft, amber text, underline on hover).
 */
export default function BackNavigation({
  href,
  label,
  className = "",
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`mb-6 inline-flex items-center gap-2 text-sm font-semibold text-amber transition hover:underline ${className}`}
    >
      <ArrowLeft size={16} />
      {label}
    </Link>
  );
}
