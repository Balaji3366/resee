import Image from "next/image";

export default function LoginLogo() {
  return (
    <div className="flex items-center gap-6">
      <div className="overflow-hidden rounded-2xl bg-white p-2 shadow-lg ring-1 ring-[#D4AF37]/20 transition-transform duration-300 hover:scale-105">
          
        <Image
        src="/Images/Mentora-logo.png"
        alt="Mentora Logo"
        width={84}
        height={84}
        priority
        unoptimized
        className="rounded-xl"
      />
      </div>

      <div>
        <h1 className="text-6xl font-extrabold tracking-tight text-slate-900">
          Mentora
        </h1>

        <p className="mt-2 text-lg font-medium">
          <span className="font-semibold text-[#0A3B2E]">
            Learn Smarter.
          </span>{" "}
          <span className="font-semibold text-[#D4AF37]">
            Grow Faster.
          </span>
        </p>
      </div>
    </div>
  );
}