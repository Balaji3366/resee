import { formatContextBlock } from "../promptBuilder";
import type { PromptResult } from "../promptBuilder";
import type { UserContext } from "@/types/ai";

export interface RoadmapParams {
  targetRole: string;
  timeframeMonths?: number;
}

export interface RoadmapResult {
  milestones: { title: string; description: string; estimatedWeeks: number }[];
}

export function buildRoadmapPrompt(context: UserContext, params: RoadmapParams): PromptResult {
  const timeframe = params.timeframeMonths ?? 6;

  const system = `You design a realistic, milestone-based learning roadmap toward a career goal.
Return ONLY valid JSON matching this exact shape, no markdown fences, no extra text:
{
  "milestones": [{ "title": string, "description": string, "estimatedWeeks": number }]
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
