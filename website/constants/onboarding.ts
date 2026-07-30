import type { RoleType, OnboardingUserType, SkillLevel } from "@/types/onboarding";

export const ROLE_TYPES: { value: RoleType; label: string; description: string }[] = [
  {
    value: "student",
    label: "Student",
    description: "Currently studying and preparing to start my career",
  },
  {
    value: "professional",
    label: "Professional",
    description: "Already working and looking to grow or switch careers",
  },
];

export const USER_TYPES: {
  value: OnboardingUserType;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    value: "student",
    label: "Student",
    icon: "🎓",
    description: "Currently studying, preparing to start my career",
  },
  {
    value: "fresher",
    label: "Fresher",
    icon: "🌱",
    description: "Recently graduated, looking for my first job",
  },
  {
    value: "professional",
    label: "Working Professional",
    icon: "💼",
    description: "Already working, looking to grow or switch",
  },
];

export const TARGET_CAREER_SUGGESTIONS: string[] = [
  "Software Engineer",
  "QA Engineer",
  "AI Engineer",
  "Data Analyst",
  "DevOps Engineer",
  "UI/UX Designer",
  "Product Manager",
  "Government Jobs",
  "Other",
];

export const SKILL_LEVELS: { value: SkillLevel; label: string; description: string }[] = [
  {
    value: "beginner",
    label: "Beginner",
    description: "Just starting out, learning the fundamentals",
  },
  {
    value: "intermediate",
    label: "Intermediate",
    description: "Comfortable with the basics, building real projects",
  },
  {
    value: "advanced",
    label: "Advanced",
    description: "Confident and job-ready, sharpening the edge",
  },
];

export const TOTAL_ONBOARDING_STEPS = 4;
