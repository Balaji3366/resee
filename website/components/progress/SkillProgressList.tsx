import type { SkillProgress } from "@/types/progress";

export default function SkillProgressList({ skills }: { skills: SkillProgress[] }) {
  return (
    <div className="rounded-3xl border border-amber/20 bg-panel p-7 shadow-md">
      <h2 className="text-lg font-semibold text-slate">Skill Progress</h2>

      <div className="mt-6 space-y-5">
        {skills.map((skill) => (
          <div key={skill.id}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-semibold text-bone">
                <span>{skill.icon}</span>
                {skill.name}
              </span>
              <span className="font-semibold text-slate">
                {skill.percent > 0 ? `${skill.percent}%` : "Not started"}
              </span>
            </div>

            <div className="h-2 rounded-full bg-panel-2">
              <div
                className="h-2 rounded-full bg-amber transition-all duration-700"
                style={{ width: `${skill.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
