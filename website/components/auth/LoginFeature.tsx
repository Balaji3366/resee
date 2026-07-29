import LoginLogo from "./LoginLogo";
import FeatureCard from "./FeatureCard";

export default function LoginFeatures() {
  return (
    <div className="flex max-w-xl flex-col justify-center">

      <LoginLogo />

      <div className="mt-8">

        <span className="rounded-full bg-amber/20 px-4 py-2 text-sm font-semibold text-amber">
          AI CAREER PLATFORM
        </span>

        <h2 className="font-display mt-6 text-5xl font-extrabold leading-tight text-bone">
          Build Your Dream Career
          <span className="block text-amber">
            with RESEE AI
          </span>
        </h2>

        <p className="mt-6 text-lg leading-8 text-slate">
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

        <span className="rounded-full border border-amber/30 bg-amber/10 px-4 py-2 text-sm font-semibold text-amber">
          ✓ ATS Friendly
        </span>

        <span className="rounded-full border border-teal/30 bg-panel-2 px-4 py-2 text-sm font-semibold text-teal">
          ✓ AI Powered
        </span>

        <span className="rounded-full border border-amber/20 bg-amber/10 px-4 py-2 text-sm font-semibold text-amber">
          ✓ Career Focused
        </span>

      </div>

    </div>
  );
}