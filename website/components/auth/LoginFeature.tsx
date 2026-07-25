import LoginLogo from "./LoginLogo";
import FeatureCard from "./FeatureCard";

export default function LoginFeatures() {
  return (
    <div className="flex max-w-xl flex-col justify-center">

      <LoginLogo />

      <div className="mt-8">

        <span className="rounded-full bg-[#D4AF37]/20 px-4 py-2 text-sm font-semibold text-[#B8860B]">
          AI CAREER PLATFORM
        </span>

        <h2 className="mt-6 text-5xl font-extrabold leading-tight text-[#06281F]">
          Build Your Dream Career
          <span className="block text-[#D4AF37]">
            with Mentora AI
          </span>
        </h2>

        <p className="mt-6 text-lg leading-8 text-gray-600">
          Analyse resumes, prepare for interviews, organise documents,
          discover career roadmaps and grow your professional skills—
          all from one intelligent platform.
        </p>

      </div>

      <div className="mt-12 space-y-6">

        <FeatureCard
          icon="📄"
          title="Resume Analyzer"
          description="Get ATS score, AI feedback and generate an improved professional resume."
        />

        <FeatureCard
          icon="📚"
          title="Document Intelligence"
          description="Upload PDFs, organise study material and chat with AI for instant answers."
        />

        <FeatureCard
          icon="🎤"
          title="Mock Interview"
          description="Practice HR and technical interviews with AI powered feedback."
        />

      </div>

      <div className="mt-10 flex flex-wrap gap-3">

        <span className="rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-2 text-sm font-semibold text-[#B8860B]">
          ✓ ATS Friendly
        </span>

        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
          ✓ AI Powered
        </span>

        <span className="rounded-full border border-[#0A3B2E]/20 bg-[#0A3B2E]/10 px-4 py-2 text-sm font-semibold text-[#0A3B2E]">
          ✓ Career Focused
        </span>

      </div>

    </div>
  );
}