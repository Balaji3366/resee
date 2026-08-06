import { FileText, Files, Mic } from "lucide-react";
import LoginLogo from "./LoginLogo";
import FeatureCard from "./FeatureCard";

/**
 * Left panel of the auth layout (shared by login and signup). Visual
 * flow, top to bottom: logo → headline → short description → feature
 * highlights → (login/signup card, rendered by the sibling column).
 * The trailing "✓ ATS Friendly / AI Powered / Career Focused" pill row
 * that used to follow the feature cards has been removed — it wasn't
 * part of that flow and read as a fourth, disconnected section between
 * the features and the card.
 */
export default function LoginFeatures() {
  return (
    <div className="flex max-w-xl flex-col justify-center">
      <LoginLogo />

      <div className="mt-10">
        <span className="inline-flex rounded-full border border-amber/30 bg-amber/10 px-3 py-1 text-xs font-bold text-amber">
          AI CAREER PLATFORM
        </span>

        <h2 className="font-display mt-5 text-5xl font-extrabold leading-[1.1] text-bone">
          Build Your Dream Career
          <span className="block text-amber">with RESEE AI</span>
        </h2>

        <p className="mt-5 text-lg leading-8 text-slate">
          Analyse resumes, prepare for interviews, organise documents, discover career roadmaps and
          grow your professional skills—all from one intelligent platform.
        </p>
      </div>

      <div className="mt-10 space-y-3">
        <FeatureCard
          icon={<FileText size={20} />}
          title="Resume Analyzer"
          description="Get ATS score, AI feedback and generate an improved professional resume."
          floatDelay={0}
        />

        <FeatureCard
          icon={<Files size={20} />}
          title="Document Intelligence"
          description="Upload PDFs, organise study material and chat with AI for instant answers."
          floatDelay={0.7}
        />

        <FeatureCard
          icon={<Mic size={20} />}
          title="Mock Interview"
          description="Practice HR and technical interviews with AI powered feedback."
          floatDelay={1.4}
        />
      </div>
    </div>
  );
}
