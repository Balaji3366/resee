import Image from "next/image";

export default function LoginLogo() {
  return (
    <div className="flex flex-col items-start">
      {/* Logo */}

      <div className="group">
        <Image
          src="/images/resee-logo.png"
          alt="RESEE Logo"
          width={92}
          height={92}
          priority
          className="rounded-2xl transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Brand */}

      <div className="mt-5">
        <h1 className="font-display text-5xl font-black tracking-[-0.03em] text-bone">
          RESEE
        </h1>

        <div className="mt-2 flex items-center gap-3">
          <div className="h-px w-10 bg-amber" />

          <p className="text-base font-medium tracking-wide text-slate">
            See Your Future
          </p>
        </div>
      </div>
    </div>
  );
}