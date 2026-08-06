import Image from "next/image";

/**
 * Compact, supportive brand mark — previously a stacked, hero-scale
 * lockup (92px logo + text-5xl wordmark) that visually competed with
 * the actual headline below it. Same content (logo, name, tagline),
 * just sized and arranged to sit quietly above the real hero instead
 * of acting as one itself.
 */
export default function LoginLogo() {
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/images/resee-logo.png"
        alt="RESEE Logo"
        width={40}
        height={40}
        priority
        className="rounded-xl"
      />

      <div className="flex items-baseline gap-2">
        <span className="font-display text-xl font-extrabold tracking-tight text-bone">RESEE</span>

        <span className="text-xs font-medium tracking-wide text-slate">See Your Future</span>
      </div>
    </div>
  );
}
