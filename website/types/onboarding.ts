export type RoleType = "student" | "professional";

export interface OnboardingAnswers {
  roleType: RoleType | "";
  education: string;
  experience: string;
  currentSkills: string[];
  targetCareer: string;
  dreamCompany: string;
  dreamSalary: string;
  studyTime: string;
  interests: string[];
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
