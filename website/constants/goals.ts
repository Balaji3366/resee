export const GOALS = [
  { id: "first-job", icon: "🎯", label: "I want my first job" },
  { id: "switch-job", icon: "🔄", label: "I want to switch my job" },
  { id: "learn-skills", icon: "📚", label: "I want to learn new skills" },
  { id: "interview-prep", icon: "🎤", label: "I want to prepare for interviews" },
] as const;

export type GoalId = (typeof GOALS)[number]["id"];

export const GOAL_LABELS: Record<GoalId, string> = {
  "first-job": "Getting your first job",
  "switch-job": "Switching your job",
  "learn-skills": "Learning new skills",
  "interview-prep": "Preparing for interviews",
};
