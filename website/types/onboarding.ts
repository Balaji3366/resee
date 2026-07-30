export type RoleType = "student" | "professional";

export type OnboardingUserType = "student" | "fresher" | "professional";

export type SkillLevel = "beginner" | "intermediate" | "advanced";

export interface OnboardingAnswers {
  userType: OnboardingUserType | "";
  goal: string;
  targetCareer: string;
  skillLevel: SkillLevel | "";
}

export interface CareerProfileAI {
  careerHealthScore: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  focusAreas: string[];
  recommendedFirstSteps: string[];
}

export interface OnboardingSubmitResponse {
  success: boolean;
  data?: CareerProfileAI;
  message?: string;
}
