import BackButton from "@/components/BackButton";

export const metadata = {
  title: "Privacy Policy | RESEE",
};

const INFO_COLLECTED = [
  "Account information (name, email address)",
  "Profile information",
  "Resume data you upload or create",
  "Learning progress",
  "Interview history",
  "AI interaction metadata",
  "Usage analytics",
  "Device and browser information",
];

const HOW_WE_USE = [
  "Provide personalized career guidance",
  "Generate AI-powered recommendations",
  "Improve resume analysis",
  "Deliver interview feedback",
  "Recommend learning paths",
  "Track career progress",
  "Improve platform performance",
  "Maintain platform security",
];

const YOUR_RIGHTS = [
  "Access your information",
  "Update your profile",
  "Delete your AI history",
  "Delete your account (subject to applicable legal requirements)",
  "Contact us regarding privacy concerns",
];

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-lg leading-8 text-slate">
          <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-ink px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <BackButton />
        </div>

        <span className="inline-flex rounded-full border border-amber/30 bg-amber/10 px-5 py-1.5 text-xs font-bold uppercase tracking-wider text-amber">
          Legal
        </span>

        <h1 className="font-display mt-6 text-4xl font-extrabold text-bone md:text-5xl">
          Privacy Policy
        </h1>

        <p className="mt-4 text-sm font-medium text-slate">Last Updated: August 2026</p>

        <p className="mt-6 text-lg leading-8 text-slate">
          At RESEE, protecting your privacy is one of our highest priorities. This Privacy Policy
          explains what information we collect, why we collect it, and how we use and protect it.
        </p>

        {/* Information We Collect */}
        <div className="mt-10 border-t border-amber/10 pt-8">
          <h2 className="font-display text-2xl font-bold text-bone md:text-3xl">
            Information We Collect
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate">
            Depending on how you use RESEE, we may collect:
          </p>

          <BulletList items={INFO_COLLECTED} />

          <p className="mt-6 text-lg leading-8 text-slate">
            We only collect information necessary to provide and improve our services.
          </p>
        </div>

        {/* How We Use Your Information */}
        <div className="mt-10 border-t border-amber/10 pt-8">
          <h2 className="font-display text-2xl font-bold text-bone md:text-3xl">
            How We Use Your Information
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate">Your information is used to:</p>

          <BulletList items={HOW_WE_USE} />
        </div>

        {/* AI Processing */}
        <div className="mt-10 border-t border-amber/10 pt-8">
          <h2 className="font-display text-2xl font-bold text-bone md:text-3xl">AI Processing</h2>

          <p className="mt-5 text-lg leading-8 text-slate">
            Some features use Artificial Intelligence to analyze resumes, interview responses, and
            career information.
          </p>

          <p className="mt-4 text-lg leading-8 text-slate">
            AI-generated content is intended to assist users and should be reviewed before making
            important career decisions.
          </p>
        </div>

        {/* Data Security */}
        <div className="mt-10 border-t border-amber/10 pt-8">
          <h2 className="font-display text-2xl font-bold text-bone md:text-3xl">Data Security</h2>

          <p className="mt-5 text-lg leading-8 text-slate">
            We implement industry-standard security measures designed to protect your information
            from unauthorized access, alteration, or disclosure.
          </p>
        </div>

        {/* Data Retention */}
        <div className="mt-10 border-t border-amber/10 pt-8">
          <h2 className="font-display text-2xl font-bold text-bone md:text-3xl">Data Retention</h2>

          <p className="mt-5 text-lg leading-8 text-slate">
            We retain your information only for as long as necessary to provide our services and
            comply with applicable legal obligations.
          </p>

          <p className="mt-4 text-lg leading-8 text-slate">
            Users may request deletion of their AI history through the Privacy Settings available
            within their account.
          </p>
        </div>

        {/* Sharing Information */}
        <div className="mt-10 border-t border-amber/10 pt-8">
          <h2 className="font-display text-2xl font-bold text-bone md:text-3xl">
            Sharing Information
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate">
            We do not sell your personal information.
          </p>

          <p className="mt-4 text-lg leading-8 text-slate">
            We may share limited information with trusted service providers that help us operate
            RESEE, such as authentication, hosting, analytics, and AI providers.
          </p>
        </div>

        {/* Your Rights */}
        <div className="mt-10 border-t border-amber/10 pt-8">
          <h2 className="font-display text-2xl font-bold text-bone md:text-3xl">Your Rights</h2>

          <p className="mt-5 text-lg leading-8 text-slate">You may:</p>

          <BulletList items={YOUR_RIGHTS} />
        </div>

        {/* Cookies */}
        <div className="mt-10 border-t border-amber/10 pt-8">
          <h2 className="font-display text-2xl font-bold text-bone md:text-3xl">Cookies</h2>

          <p className="mt-5 text-lg leading-8 text-slate">
            RESEE may use cookies and similar technologies to improve user experience, maintain
            sessions, and analyze platform usage.
          </p>
        </div>

        {/* Changes */}
        <div className="mt-10 border-t border-amber/10 pt-8">
          <h2 className="font-display text-2xl font-bold text-bone md:text-3xl">Changes</h2>

          <p className="mt-5 text-lg leading-8 text-slate">
            We may update this Privacy Policy from time to time. Continued use of RESEE after
            updates constitutes acceptance of the revised policy.
          </p>
        </div>

        {/* Contact */}
        <div className="mt-10 border-t border-amber/10 pt-8">
          <h2 className="font-display text-2xl font-bold text-bone md:text-3xl">Contact</h2>

          <p className="mt-5 text-lg leading-8 text-slate">
            For privacy-related questions, please contact the RESEE support team.
          </p>
        </div>
      </div>
    </div>
  );
}
