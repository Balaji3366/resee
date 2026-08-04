import { formatContextBlock } from "../promptBuilder";
import type { UserContext } from "@/types/ai";
import type { WorkspaceIntelligenceDigest } from "../workspaceContext";

export interface CareerCoachConversationParams {
  message: string;
  history: { sender: "AI" | "You"; text: string }[];
}

/**
 * The AI Workspace's Career Coach mode system prompt (Decision 6,
 * docs/product/ai-product-specification.md §2 Domain E.3) — replaces
 * this file's original v1.0 export, `buildCareerCoachingPrompt()`, which
 * built a strictly single-turn prompt demanding a fixed `{ reply,
 * suggestedActions }` JSON shape and threaded no conversation history at
 * all. That design was explicitly superseded: Career Coach mode is now a
 * multi-turn, streamed conversation sharing the same transport as
 * General Assistant mode, so there is no longer a single parseable JSON
 * object to demand — the reply streams as free-form markdown text, same
 * as General mode, just grounded in the candidate's real ReSee activity
 * and billed per session instead of being free.
 *
 * Nothing else in the codebase called the old export (confirmed during
 * the AI Workspace design sprint's audit — the `career_coaching`
 * AIFeature slug and this file's prompt builder had never been wired to
 * a live route), so this is a direct replacement, not an addition.
 */
export function buildCareerCoachSystemPrompt(
  context: UserContext,
  intelligence: WorkspaceIntelligenceDigest,
  params: CareerCoachConversationParams
): string {
  const contextBlock = formatContextBlock({
    careerGoal: context.careerGoal,
    targetCareer: context.targetCareer,
    skillLevel: context.skillLevel,
    completedCourses: context.learning.completedCourseCount,
    currentStreak: context.learning.currentStreak,
    interviewsCompleted: context.interviews.completedCount,
    savedJobs: context.jobs.savedJobCount,
    weakTopics: context.practice.weakTopics,
    strongTopics: context.practice.strongTopics,
    latestResumeAnalysisScore: intelligence.latestResumeAnalysis?.atsScore,
    latestInterviewEvaluationScore: intelligence.latestInterviewEvaluation?.overallScore,
  });

  return `You are RESEE AI in Career Coach mode — a career-focused guide grounded in this candidate's real activity on the ReSee platform, not a general-purpose assistant.

Never say you are Gemini, Google, or OpenAI. If asked who you are, reply: "I'm RESEE AI, your Career Coach."

==================================================
CANDIDATE CONTEXT (SOURCE OF TRUTH — never contradict this)
==================================================

${contextBlock}

==================================================
STYLE
==================================================

- Be direct, encouraging, and specific — ground advice in the context above rather than generic career tips.
- Reference the candidate's real progress (resume analysis score, interview evaluation score, learning streak, weak/strong topics) when it's relevant to what they're asking.
- Use short paragraphs and bullet points; bold the key action in a recommendation.
- Never invent a fact about the candidate's history that isn't present in the context above.
- If asked something with no career/learning/interview/resume relevance, gently note that General Assistant mode is a better fit, then still help.
- Return valid GitHub Markdown.

==================================================
CONVERSATION HISTORY
==================================================

${params.history
  .slice(-8)
  .map((m) => `${m.sender}: ${m.text}`)
  .join("\n")}

==================================================
CANDIDATE'S MESSAGE
==================================================

${params.message}
`;
}
