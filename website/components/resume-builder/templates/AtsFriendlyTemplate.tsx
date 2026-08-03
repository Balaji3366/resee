import type { ResumeContent } from "@/types/resume-builder";

export default function AtsFriendlyTemplate({ content }: { content: ResumeContent }) {
  const { personalInfo, education, experience, projects, skills, certifications } = content;

  const links = [
    personalInfo.linkedin ? `LinkedIn: ${personalInfo.linkedin}` : null,
    personalInfo.github ? `GitHub: ${personalInfo.github}` : null,
    personalInfo.portfolio ? `Portfolio: ${personalInfo.portfolio}` : null,
  ].filter((l): l is string => l !== null);

  return (
    <div
      className="min-h-[11in] w-[8.5in] bg-white p-12 text-black"
      style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
      id="resume-print-root"
    >
      <header>
        <h1 className="text-2xl font-bold">{personalInfo.fullName || "Your Name"}</h1>
        <p className="mt-1 text-sm">
          {[personalInfo.email, personalInfo.phone, personalInfo.address]
            .filter(Boolean)
            .join(" | ")}
        </p>
        {links.length > 0 ? <p className="text-sm">{links.join(" | ")}</p> : null}
      </header>

      <div className="mt-5 space-y-5">
        {personalInfo.summary && (
          <section>
            <h2 className="border-b border-black pb-1 text-sm font-bold uppercase">Summary</h2>
            <p className="mt-2 text-sm leading-relaxed">{personalInfo.summary}</p>
          </section>
        )}

        {education.length > 0 && (
          <section>
            <h2 className="border-b border-black pb-1 text-sm font-bold uppercase">Education</h2>
            <div className="mt-2 text-sm leading-relaxed">
              {education.map((item) => (
                <div key={item.id} className="mb-2">
                  <p className="font-bold">
                    {item.degree}
                    {item.field ? `, ${item.field}` : ""}
                  </p>
                  <p>
                    {item.institution} | {item.startDate} - {item.endDate}
                  </p>
                  {item.description ? <p>{item.description}</p> : null}
                </div>
              ))}
            </div>
          </section>
        )}

        {experience.length > 0 && (
          <section>
            <h2 className="border-b border-black pb-1 text-sm font-bold uppercase">Experience</h2>
            <div className="mt-2 text-sm leading-relaxed">
              {experience.map((item) => (
                <div key={item.id} className="mb-3">
                  <p className="font-bold">
                    {item.role}, {item.company}
                  </p>
                  <p>
                    {item.startDate} - {item.current ? "Present" : item.endDate}
                  </p>
                  <ul className="list-disc pl-5">
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
            <h2 className="border-b border-black pb-1 text-sm font-bold uppercase">Projects</h2>
            <div className="mt-2 text-sm leading-relaxed">
              {projects.map((item) => (
                <div key={item.id} className="mb-2">
                  <p className="font-bold">{item.name}</p>
                  <p>{item.description}</p>
                  {item.techStack.length > 0 ? <p>Tech: {item.techStack.join(", ")}</p> : null}
                  {item.link ? <p>{item.link}</p> : null}
                </div>
              ))}
            </div>
          </section>
        )}

        {skills.length > 0 && (
          <section>
            <h2 className="border-b border-black pb-1 text-sm font-bold uppercase">Skills</h2>
            <p className="mt-2 text-sm leading-relaxed">{skills.join(", ")}</p>
          </section>
        )}

        {certifications.length > 0 && (
          <section>
            <h2 className="border-b border-black pb-1 text-sm font-bold uppercase">
              Certifications
            </h2>
            <div className="mt-2 text-sm leading-relaxed">
              {certifications.map((item) => (
                <p key={item.id}>
                  {item.name} — {item.issuer}, {item.date}
                </p>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
