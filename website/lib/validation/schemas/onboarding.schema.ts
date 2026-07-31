import { z } from "zod";

export const onboardingRequestSchema = z.object({
  userId: z.string().min(1, "userId is required."),
  answers: z.object({
    userType: z.enum(["student", "fresher", "professional", ""]),
    goal: z.string().min(1, "goal is required."),
    targetCareer: z.string().min(1, "targetCareer is required."),
    skillLevel: z.enum(["beginner", "intermediate", "advanced", ""]),
  }),
});

export type OnboardingRequest = z.infer<typeof onboardingRequestSchema>;
