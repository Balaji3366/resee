import { RESUME_SECTION_LABELS, type ResumeContent } from "@/types/resume-builder";

export default function ModernTemplate({ content }: { content: ResumeContent }) {
  const { personalInfo, sections } = content;

  return (
    <div className="min-h-[11in] w-[8.5in] bg-white p-12 text-[#1a1a2e]" id="resume-print-root">
      <header className="border-b-4 border-sky-600 pb-4">
        <h1 className="text-4xl font-bold tracking-tight">{personalInfo.fullName || "Your Name"}</h1>
        {personalInfo.title ? (
          <p className="mt-1 text-lg font-medium text-sky-700">{personalInfo.title}</p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
          {personalInfo.email ? <span>{personalInfo.email}</span> : null}
          {personalInfo.phone ? <span>{personalInfo.phone}</span> : null}
          {personalInfo.location ? <span>{personalInfo.location}</span> : null}
          {personalInfo.links.map((link) => (
            <span key={link.url}>{link.label}: {link.url}</span>
          ))}
        </div>
      </header>

      <div className="mt-6 space-y-6">
        {sections
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((section) => (
            <section key={section.id}>
              <h2 className="mb-2 text-sm font-bold uppercase tracking-widest text-sky-700">
                {RESUME_SECTION_LABELS[section.type]}
              </h2>

              {section.type === "summary" && (
                <p className="text-sm leading-relaxed text-gray-800">{section.data.text}</p>
              )}

              {section.type === "experience" && (
                <div className="space-y-4">
                  {section.data.items.map((item) => (
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
              )}

              {section.type === "education" && (
                <div className="space-y-3">
                  {section.data.items.map((item) => (
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
                      {item.description ? (
                        <p className="text-sm text-gray-700">{item.description}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}

              {section.type === "skills" && (
                <div className="flex flex-wrap gap-2">
                  {section.data.items.map((skill, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {section.type === "projects" && (
                <div className="space-y-3">
                  {section.data.items.map((item) => (
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
              )}

              {section.type === "certifications" && (
                <div className="space-y-2">
                  {section.data.items.map((item) => (
                    <div key={item.id} className="flex items-baseline justify-between text-sm">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-gray-500">
                        {item.issuer} · {item.date}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {(section.type === "achievements" || section.type === "interests") && (
                <ul className="list-disc space-y-1 pl-5 text-sm text-gray-800">
                  {section.data.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}

              {section.type === "languages" && (
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-800">
                  {section.data.items.map((item, i) => (
                    <span key={i}>
                      {item.name} <span className="text-gray-500">({item.level})</span>
                    </span>
                  ))}
                </div>
              )}

              {section.type === "references" && (
                <div className="space-y-2">
                  {section.data.items.map((item) => (
                    <div key={item.id} className="text-sm">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-gray-600">
                        {item.relation} · {item.contact}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
      </div>
    </div>
  );
}
