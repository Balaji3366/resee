import type { ResumeContent } from "@/types/resume-builder";

export default function ModernTemplate({ content }: { content: ResumeContent }) {
  const { personalInfo, education, experience, projects, skills, certifications } = content;

  const links = [
    personalInfo.linkedin ? { label: "LinkedIn", url: personalInfo.linkedin } : null,
    personalInfo.github ? { label: "GitHub", url: personalInfo.github } : null,
    personalInfo.portfolio ? { label: "Portfolio", url: personalInfo.portfolio } : null,
  ].filter((l): l is { label: string; url: string } => l !== null);

  return (
    <div className="min-h-[11in] w-[8.5in] bg-white p-12 text-[#1a1a2e]" id="resume-print-root">
      <header className="border-b-4 border-sky-600 pb-4">
        <h1 className="text-4xl font-bold tracking-tight">{personalInfo.fullName || "Your Name"}</h1>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
          {personalInfo.email ? <span>{personalInfo.email}</span> : null}
          {personalInfo.phone ? <span>{personalInfo.phone}</span> : null}
          {personalInfo.address ? <span>{personalInfo.address}</span> : null}
          {links.map((link) => (
            <span key={link.url}>{link.label}: {link.url}</span>
          ))}
        </div>
      </header>

      <div className="mt-6 space-y-6">
        {education.length > 0 && (
          <section>
            <h2 className="mb-2 text-sm font-bold uppercase tracking-widest text-sky-700">Education</h2>
            <div className="space-y-3">
              {education.map((item) => (
                <div key={item.id}>
                  <div className="flex items-baseline justify-between">
                    <p className="font-semibold">{item.institution}</p>
                    <p className="text-xs text-gray-500">
                      {item.startDate} – {item.endDate}
                    </p>
                  </div>
                  <p className="text-sm text-gray-700">
                    {item.degree}
                    {item.field ? `, ${item.field}` : ""}
                  </p>
                  {item.description ? <p className="text-sm text-gray-700">{item.description}</p> : null}
                </div>
              ))}
            </div>
          </section>
        )}

        {experience.length > 0 && (
          <section>
            <h2 className="mb-2 text-sm font-bold uppercase tracking-widest text-sky-700">Experience</h2>
            <div className="space-y-4">
              {experience.map((item) => (
                <div key={item.id}>
                  <div className="flex items-baseline justify-between">
                    <p className="font-semibold">{item.role}</p>
                    <p className="text-xs text-gray-500">
                      {item.startDate} – {item.current ? "Present" : item.endDate}
                    </p>
                  </div>
                  <p className="text-sm text-gray-700">{item.company}</p>
                  <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-gray-800">
                    {item.bullets.map((bullet, i) => (
                      <li key={i}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {projects.length > 0 && (
          <section>
            <h2 className="mb-2 text-sm font-bold uppercase tracking-widest text-sky-700">Projects</h2>
            <div className="space-y-3">
              {projects.map((item) => (
                <div key={item.id}>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-800">{item.description}</p>
                  {item.techStack.length > 0 ? (
                    <p className="text-xs text-gray-500">{item.techStack.join(" · ")}</p>
                  ) : null}
                  {item.link ? <p className="text-xs text-sky-700">{item.link}</p> : null}
                </div>
              ))}
            </div>
          </section>
        )}

        {skills.length > 0 && (
          <section>
            <h2 className="mb-2 text-sm font-bold uppercase tracking-widest text-sky-700">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <span key={i} className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {certifications.length > 0 && (
          <section>
            <h2 className="mb-2 text-sm font-bold uppercase tracking-widest text-sky-700">Certifications</h2>
            <div className="space-y-2">
              {certifications.map((item) => (
                <div key={item.id} className="flex items-baseline justify-between text-sm">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-gray-500">
                    {item.issuer} · {item.date}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
