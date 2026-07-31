/**
 * Typed feature-flag scaffold. All false today — nothing in the running
 * app calls any of the 9 AI capabilities yet (see
 * docs/architecture/ai-architecture.md). Each flips to true individually
 * as its feature ships, per docs/roadmap/roadmap.md's Phase 2. This is a
 * static, code-level scaffold, not a remote-config system — introduce one
 * only if these need to change without a deploy.
 */
export const featureFlags = {
  aiResumeAnalysis: false,
  aiResumeRewrite: false,
  aiJobMatch: false,
  aiInterviewEvaluation: false,
  aiCareerRoadmap: false,
  aiSkillGap: false,
  aiCareerCoaching: false,
  aiLearningRecommendation: false,
  aiDailyRecommendation: false,
} as const;

export type FeatureFlag = keyof typeof featureFlags;
