import { RESUME_SECTION_LABELS, type ResumeContent } from "@/types/resume-builder";

export default function AtsFriendlyTemplate({ content }: { content: ResumeContent }) {
  const { personalInfo, sections } = content;

  return (
    <div
      className="min-h-[11in] w-[8.5in] bg-white p-12 text-black"
      style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
      id="resume-print-root"
    >
      <header>
        <h1 className="text-2xl font-bold">{personalInfo.fullName || "Your Name"}</h1>
        {personalInfo.title ? <p className="text-base">{personalInfo.title}</p> : null}
        <p className="mt-1 text-sm">
          {[personalInfo.email, personalInfo.phone, personalInfo.location]
            .filter(Boolean)
            .join(" | ")}
        </p>
        {personalInfo.links.length > 0 ? (
          <p className="text-sm">
            {personalInfo.links.map((link) => `${link.label}: ${link.url}`).join(" | ")}
          </p>
        ) : null}
      </header>

      <div className="mt-5 space-y-5">
        {sections
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((section) => (
            <section key={section.id}>
              <h2 className="border-b border-black pb-1 text-sm font-bold uppercase">
                {RESUME_SECTION_LABELS[section.type]}
              </h2>

              <div className="mt-2 text-sm leading-relaxed">
                {section.type === "summary" && <p>{section.data.text}</p>}

                {section.type === "experience" &&
                  section.data.items.map((item) => (
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

                {section.type === "education" &&
                  section.data.items.map((item) => (
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

                {section.type === "skills" && <p>{section.data.items.join(", ")}</p>}

                {section.type === "projects" &&
                  section.data.items.map((item) => (
                    <div key={item.id} className="mb-2">
                      <p className="font-bold">{item.name}</p>
                      <p>{item.description}</p>
                      {item.techStack.length > 0 ? <p>Tech: {item.techStack.join(", ")}</p> : null}
                      {item.link ? <p>{item.link}</p> : null}
                    </div>
                  ))}

                {section.type === "certifications" &&
                  section.data.items.map((item) => (
                    <p key={item.id}>
                      {item.name} — {item.issuer}, {item.date}
                    </p>
                  ))}

                {(section.type === "achievements" || section.type === "interests") && (
                  <ul className="list-disc pl-5">
                    {section.data.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}

                {section.type === "languages" && (
                  <p>
                    {section.data.items.map((item) => `${item.name} (${item.level})`).join(", ")}
                  </p>
                )}

                {section.type === "references" &&
                  section.data.items.map((item) => (
                    <p key={item.id}>
                      {item.name} — {item.relation}, {item.contact}
                    </p>
                  ))}
              </div>
            </section>
          ))}
      </div>
    </div>
  );
}
