import { formatContextBlock } from "../promptBuilder";
import type { PromptResult } from "../promptBuilder";
import type { UserContext } from "@/types/ai";

export interface RoadmapParams {
  targetRole: string;
  timeframeMonths?: number;
}

export interface RoadmapMilestone {
  title: string;
  description: string;
  estimatedWeeks: number;
  /** Skills/technologies/objectives this milestone is about — the AI's
   *  job stops here. A separate, deterministic catalog-mapping layer
   *  (lib/careerRoadmapCatalogMatch.ts) attaches a real ReSee course to
   *  each milestone where one exists; the AI never names a course
   *  itself, closing the hallucination risk of inventing content that
   *  doesn't exist on the platform. */
  suggestedSkills: string[];
}

export interface RoadmapResult {
  milestones: RoadmapMilestone[];
}

export function buildRoadmapPrompt(context: UserContext, params: RoadmapParams): PromptResult {
  const timeframe = params.timeframeMonths ?? 6;

  const system = `You design a realistic, milestone-based learning roadmap toward a career goal.
Describe what to learn generically, in terms of skills, technologies, and objectives — never
reference or invent a specific course, lesson, certification, or platform name, since you have no
knowledge of what content actually exists on this platform; a separate system attaches real
course links afterward wherever a match exists.
Return ONLY valid JSON matching this exact shape, no markdown fences, no extra text:
{
  "milestones": [{
    "title": string,
    "description": string,
    "estimatedWeeks": number,
    "suggestedSkills": string[] (1-4 concrete skills/technologies this milestone covers)
  }]
}
Milestones should be ordered, concrete, and fit within the given timeframe.`;

  const user = `Candidate's current standing:
${formatContextBlock({
  skillLevel: context.skillLevel,
  completedCourses: context.learning.completedCourseCount,
  strongTopics: context.practice.strongTopics,
  weakTopics: context.practice.weakTopics,
})}

Target role: ${params.targetRole}
Timeframe: ${timeframe} months

Design the roadmap and return the JSON described above.`;

  return { system, user };
}
