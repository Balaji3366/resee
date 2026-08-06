import BackButton from "@/components/BackButton";

export const metadata = {
  title: "About | RESEE",
};

const OFFERINGS = [
  "AI Resume Intelligence",
  "AI Mock Interviews",
  "Career Roadmaps",
  "Skill Gap Analysis",
  "Learning Recommendations",
  "Smart Job Matching",
  "AI Career Coach",
  "Career Progress Tracking",
  "Resume Management",
  "Interview Practice",
  "Learning Workspace",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-ink px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <BackButton />
        </div>

        <span className="inline-flex rounded-full border border-amber/30 bg-amber/10 px-5 py-1.5 text-xs font-bold uppercase tracking-wider text-amber">
          About RESEE
        </span>

        <h1 className="font-display mt-6 text-4xl font-extrabold text-bone md:text-5xl">
          Your Career. One Intelligent Platform.
        </h1>

        <p className="mt-6 text-lg leading-8 text-slate">
          RESEE is an AI-powered Career Operating System built to help people learn, practice,
          prepare, and get hired with confidence.
        </p>

        <p className="mt-4 text-lg leading-8 text-slate">
          Instead of relying on multiple websites for learning, resume building, interview
          preparation, job tracking, and career guidance, RESEE brings everything together into one
          intelligent ecosystem.
        </p>

        <p className="mt-4 text-lg leading-8 text-slate">
          Whether you&apos;re a student starting your journey, a fresher preparing for your first
          interview, or a professional planning your next career move, RESEE adapts to your goals
          and helps you make smarter career decisions.
        </p>

        {/* Our Mission */}
        <div className="mt-10 border-t border-amber/10 pt-8">
          <h2 className="font-display text-2xl font-bold text-bone md:text-3xl">Our Mission</h2>

          <p className="mt-5 text-lg leading-8 text-slate">Our mission is simple:</p>

          <p className="mt-3 text-xl font-bold leading-8 text-bone">
            Make world-class career guidance accessible to everyone.
          </p>

          <p className="mt-5 text-lg leading-8 text-slate">
            We believe career success should never depend on expensive coaching, personal
            connections, or guesswork.
          </p>

          <p className="mt-4 text-lg leading-8 text-slate">
            Every learner deserves personalized guidance, practical learning, honest feedback, and
            AI-powered support that helps them continuously improve.
          </p>
        </div>

        {/* What RESEE Offers */}
        <div className="mt-10 border-t border-amber/10 pt-8">
          <h2 className="font-display text-2xl font-bold text-bone md:text-3xl">
            What RESEE Offers
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate">
            RESEE combines multiple career tools into one seamless platform:
          </p>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {OFFERINGS.map((offering) => (
              <li
                key={offering}
                className="flex items-center gap-3 rounded-xl border border-amber/10 bg-panel px-4 py-3"
              >
                <span className="h-2 w-2 shrink-0 rounded-full bg-amber" />
                <span className="font-medium text-bone">{offering}</span>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-lg leading-8 text-slate">
            Everything works together to help you move from learning to getting hired.
          </p>
        </div>

        {/* Our Vision */}
        <div className="mt-10 border-t border-amber/10 pt-8">
          <h2 className="font-display text-2xl font-bold text-bone md:text-3xl">Our Vision</h2>

          <p className="mt-5 text-lg leading-8 text-slate">
            We&apos;re building more than another AI application.
          </p>

          <p className="mt-4 text-lg leading-8 text-slate">
            We&apos;re building the operating system for every professional&apos;s career — one
            platform that grows with you from your first resume to your dream job and beyond.
          </p>
        </div>

        {/* Our Promise */}
        <div className="mt-10 border-t border-amber/10 pt-8">
          <h2 className="font-display text-2xl font-bold text-bone md:text-3xl">Our Promise</h2>

          <p className="mt-5 text-lg leading-8 text-slate">
            We believe technology should empower people, not replace them.
          </p>

          <p className="mt-4 text-lg leading-8 text-slate">
            AI can guide, recommend, analyze, and accelerate learning, but your final decisions,
            growth, and success will always belong to you.
          </p>
        </div>

        {/* Closing */}
        <p className="mt-10 border-t border-amber/10 pt-8 text-xl font-bold leading-9 text-bone">
          Your career isn&apos;t built in one day. It&apos;s built one smart decision at a time.{" "}
          <span className="text-amber">RESEE helps you make those decisions.</span>
        </p>
      </div>
    </div>
  );
}
