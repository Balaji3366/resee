import BackButton from "@/components/BackButton";

export const metadata = {
  title: "Terms of Service | RESEE",
};

const ACCEPTABLE_USE = [
  "Misuse or abuse the platform",
  "Attempt unauthorized access",
  "Upload malicious content",
  "Disrupt platform operations",
  "Violate applicable laws",
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

export default function TermsOfServicePage() {
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
          Terms of Service
        </h1>

        <p className="mt-4 text-sm font-medium text-slate">Last Updated: August 2026</p>

        <p className="mt-6 text-lg leading-8 text-slate">Welcome to RESEE.</p>

        <p className="mt-4 text-lg leading-8 text-slate">
          By accessing or using RESEE, you agree to comply with these Terms of Service.
        </p>

        {/* Acceptance */}
        <div className="mt-10 border-t border-amber/10 pt-8">
          <h2 className="font-display text-2xl font-bold text-bone md:text-3xl">Acceptance</h2>

          <p className="mt-5 text-lg leading-8 text-slate">
            By creating an account or using RESEE, you acknowledge that you have read and accepted
            these Terms.
          </p>
        </div>

        {/* Eligibility */}
        <div className="mt-10 border-t border-amber/10 pt-8">
          <h2 className="font-display text-2xl font-bold text-bone md:text-3xl">Eligibility</h2>

          <p className="mt-5 text-lg leading-8 text-slate">
            You must comply with all applicable laws while using RESEE.
          </p>

          <p className="mt-4 text-lg leading-8 text-slate">
            You are responsible for maintaining the security of your account credentials.
          </p>
        </div>

        {/* Acceptable Use */}
        <div className="mt-10 border-t border-amber/10 pt-8">
          <h2 className="font-display text-2xl font-bold text-bone md:text-3xl">Acceptable Use</h2>

          <p className="mt-5 text-lg leading-8 text-slate">You agree not to:</p>

          <BulletList items={ACCEPTABLE_USE} />
        </div>

        {/* AI Services */}
        <div className="mt-10 border-t border-amber/10 pt-8">
          <h2 className="font-display text-2xl font-bold text-bone md:text-3xl">AI Services</h2>

          <p className="mt-5 text-lg leading-8 text-slate">
            RESEE provides AI-powered career guidance.
          </p>

          <p className="mt-4 text-lg leading-8 text-slate">
            AI-generated responses are intended as informational assistance only and should not be
            considered professional, legal, financial, or employment advice.
          </p>

          <p className="mt-4 text-lg leading-8 text-slate">
            Users are responsible for reviewing AI-generated recommendations before making important
            decisions.
          </p>
        </div>

        {/* User Content */}
        <div className="mt-10 border-t border-amber/10 pt-8">
          <h2 className="font-display text-2xl font-bold text-bone md:text-3xl">User Content</h2>

          <p className="mt-5 text-lg leading-8 text-slate">
            You retain ownership of the resumes, documents, interview responses, and other content
            you upload.
          </p>

          <p className="mt-4 text-lg leading-8 text-slate">
            By using RESEE, you grant us the necessary rights to process this content solely for
            providing platform functionality.
          </p>
        </div>

        {/* Intellectual Property */}
        <div className="mt-10 border-t border-amber/10 pt-8">
          <h2 className="font-display text-2xl font-bold text-bone md:text-3xl">
            Intellectual Property
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate">
            All RESEE branding, software, designs, logos, and original platform content remain the
            intellectual property of RESEE.
          </p>
        </div>

        {/* Availability */}
        <div className="mt-10 border-t border-amber/10 pt-8">
          <h2 className="font-display text-2xl font-bold text-bone md:text-3xl">Availability</h2>

          <p className="mt-5 text-lg leading-8 text-slate">
            We strive to maintain reliable service but cannot guarantee uninterrupted availability.
          </p>

          <p className="mt-4 text-lg leading-8 text-slate">
            Features may change, improve, or be discontinued over time.
          </p>
        </div>

        {/* Limitation of Liability */}
        <div className="mt-10 border-t border-amber/10 pt-8">
          <h2 className="font-display text-2xl font-bold text-bone md:text-3xl">
            Limitation of Liability
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate">
            RESEE is provided on an &quot;as available&quot; basis.
          </p>

          <p className="mt-4 text-lg leading-8 text-slate">
            To the maximum extent permitted by law, RESEE shall not be liable for indirect,
            incidental, or consequential damages resulting from use of the platform.
          </p>
        </div>

        {/* Termination */}
        <div className="mt-10 border-t border-amber/10 pt-8">
          <h2 className="font-display text-2xl font-bold text-bone md:text-3xl">Termination</h2>

          <p className="mt-5 text-lg leading-8 text-slate">
            We reserve the right to suspend or terminate accounts that violate these Terms or misuse
            the platform.
          </p>

          <p className="mt-4 text-lg leading-8 text-slate">
            Users may stop using RESEE at any time.
          </p>
        </div>

        {/* Changes */}
        <div className="mt-10 border-t border-amber/10 pt-8">
          <h2 className="font-display text-2xl font-bold text-bone md:text-3xl">Changes</h2>

          <p className="mt-5 text-lg leading-8 text-slate">
            These Terms may be updated periodically. Continued use of RESEE after changes
            constitutes acceptance of the revised Terms.
          </p>
        </div>

        {/* Contact */}
        <div className="mt-10 border-t border-amber/10 pt-8">
          <h2 className="font-display text-2xl font-bold text-bone md:text-3xl">Contact</h2>

          <p className="mt-5 text-lg leading-8 text-slate">
            If you have questions regarding these Terms, please contact the RESEE support team.
          </p>
        </div>
      </div>
    </div>
  );
}
