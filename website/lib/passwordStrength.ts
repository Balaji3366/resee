export type StrengthResult = {
  score: 0 | 1 | 2 | 3 | 4;
  label: "Too weak" | "Weak" | "Fair" | "Good" | "Strong";
};

const LABELS: StrengthResult["label"][] = [
  "Too weak",
  "Weak",
  "Fair",
  "Good",
  "Strong",
];

export function getPasswordStrength(password: string): StrengthResult {
  if (!password) return { score: 0, label: LABELS[0] };

  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const capped = Math.min(score, 4) as StrengthResult["score"];

  return { score: capped, label: LABELS[capped] };
}
