type Experience = {
  company: string;
  role: string;
  location: string;
  duration: string;
  points: string[];
};

type Education = {
  degree: string;
  college: string;
  year: string;
};

type ResumeData = {
  name: string;
  email: string;
  phone: string;
  summary: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
};

type Props = {
  data: ResumeData;
};

export default function ResumePreview({ data }: Props) {
  return (
    <div className="mx-auto w-full max-w-4xl rounded-2xl bg-panel p-12 shadow-2xl">

      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="font-display text-4xl font-extrabold text-bone">
          {data.name}
        </h1>

        <p className="mt-2 text-slate">
          {data.phone} • {data.email}
        </p>
      </div>

      {/* Summary */}
      <section className="mt-8">
        <h2 className="font-display mb-3 text-xl font-bold text-teal uppercase tracking-wide">
          Professional Summary
        </h2>

        <p className="leading-8 text-bone">
          {data.summary}
        </p>
      </section>

      {/* Skills */}
      <section className="mt-10">
        <h2 className="font-display mb-4 text-xl font-bold text-teal uppercase tracking-wide">
          Skills
        </h2>

        <div className="flex flex-wrap gap-3">
          {data.skills.map((skill, index) => (
            <span
              key={index}
              className="rounded-full bg-teal-dim/20 px-4 py-2 text-sm font-semibold text-teal"
            >
              {skill}
            </span>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section className="mt-10">
        <h2 className="font-display mb-5 text-xl font-bold text-teal uppercase tracking-wide">
          Professional Experience
        </h2>

        {data.experience.map((job, index) => (
          <div
            key={index}
            className="mb-8 rounded-xl border p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">
                  {job.company}
                </h3>

                <p className="font-medium text-slate">
                  {job.role}
                </p>
              </div>

              <div className="text-right text-sm text-slate">
                <p>{job.location}</p>
                <p>{job.duration}</p>
              </div>
            </div>

            <ul className="mt-5 list-disc space-y-2 pl-6">
              {job.points.map((point, i) => (
                <li key={i} className="leading-7 text-bone">
                  {point}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Education */}
      <section className="mt-10">
        <h2 className="font-display mb-4 text-xl font-bold text-teal uppercase tracking-wide">
          Education
        </h2>

        {data.education.map((edu, index) => (
          <div
            key={index}
            className="rounded-xl border p-5"
          >
            <h3 className="font-bold">
              {edu.degree}
            </h3>

            <p className="text-slate">
              {edu.college}
            </p>

            <p className="mt-1 text-sm text-slate">
              {edu.year}
            </p>
          </div>
        ))}
      </section>

    </div>
  );
}