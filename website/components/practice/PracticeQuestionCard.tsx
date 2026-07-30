import QuizOptionButton from "@/components/learning/QuizOptionButton";
import type { PracticeQuestionPublic } from "@/types/practice";

export default function PracticeQuestionCard({
  question,
  selectedOptionIds,
  onToggle,
}: {
  question: PracticeQuestionPublic;
  selectedOptionIds: string[];
  onToggle: (optionId: string) => void;
}) {
  return (
    <div>
      <p className="font-display text-xl font-bold text-bone">{question.question}</p>

      <div className="mt-6 space-y-3">
        {question.options.map((option) => (
          <QuizOptionButton
            key={option.id}
            label={option.text}
            selected={selectedOptionIds.includes(option.id)}
            onClick={() => onToggle(option.id)}
          />
        ))}
      </div>
    </div>
  );
}
