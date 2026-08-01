import * as RadixAvatar from "@radix-ui/react-avatar";

type AvatarSize = "sm" | "md" | "lg";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  /** Fallback initials shown while the image loads or if it fails/is absent. */
  name?: string;
  size?: AvatarSize;
  className?: string;
}

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-16 w-16 text-lg",
};

function initialsFrom(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase() || "?";
}

/**
 * Built on @radix-ui/react-avatar — handles the image-load-failure
 * fallback timing correctly (Radix delays showing the fallback until it
 * genuinely knows the image won't load, avoiding a flash of initials
 * before a slow-loading image finishes).
 */
export default function Avatar({ src, alt = "", name, size = "md", className = "" }: AvatarProps) {
  return (
    <RadixAvatar.Root
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-amber-dim font-display font-bold text-ink ${SIZE_CLASSES[size]} ${className}`}
    >
      {src && <RadixAvatar.Image src={src} alt={alt} className="h-full w-full object-cover" />}
      <RadixAvatar.Fallback delayMs={src ? 400 : 0}>{initialsFrom(name)}</RadixAvatar.Fallback>
    </RadixAvatar.Root>
  );
}
