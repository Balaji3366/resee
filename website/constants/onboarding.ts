import type { RoleType } from "@/types/onboarding";

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

export const STUDY_TIME_OPTIONS: string[] = [
  "Less than 1 hour/day",
  "1-2 hours/day",
  "2-4 hours/day",
  "4+ hours/day",
];

export const SKILL_SUGGESTIONS: string[] = [
  "JavaScript",
  "Python",
  "React",
  "Node.js",
  "SQL",
  "Data Structures & Algorithms",
  "AWS",
  "Communication",
];

export const INTEREST_SUGGESTIONS: string[] = [
  "Web Development",
  "AI / Machine Learning",
  "Data Analysis",
  "Cloud Computing",
  "Cybersecurity",
  "Product Management",
  "UI/UX Design",
];

export const TOTAL_ONBOARDING_STEPS = 5;
