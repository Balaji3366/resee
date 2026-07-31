import type { InterviewQuestionPublic } from "@/types/interview";

export default function InterviewQuestionCard({
  question,
  answer,
  onChange,
}: {
  question: InterviewQuestionPublic;
  answer: string;
  onChange: (value: string) => void;
}) {
  const isLong = question.questionType === "long_text";

  return (
    <div>
      <p className="text-xl font-semibold text-bone">{question.question}</p>

      <textarea
        value={answer}
        onChange={(e) => onChange(e.target.value)}
        rows={isLong ? 11 : 5}
        placeholder={isLong ? "Take your time and answer in full sentences..." : "Type your answer..."}
        className="mt-5 w-full rounded-xl border border-bone/15 bg-ink px-5 py-4 text-base text-bone placeholder:text-slate focus:border-amber focus:outline-none"
      />
    </div>
  );
}
