import QuizOptionButton from "@/components/learning/QuizOptionButton";
import FillBlankInput from "@/components/learning/FillBlankInput";
import type { PracticeQuestionPublic } from "@/types/practice";

export default function PracticeQuestionCard({
  question,
  selectedOptionIds,
  onToggle,
  onTextChange,
}: {
  question: PracticeQuestionPublic;
  selectedOptionIds: string[];
  onToggle: (optionId: string) => void;
  onTextChange?: (text: string) => void;
}) {
  return (
    <div>
      <p className="font-display text-xl font-bold text-bone">{question.question}</p>

      <div className="mt-6 space-y-3">
        {question.questionType === "fill_blank" ? (
          <FillBlankInput
            value={selectedOptionIds[0] ?? ""}
            onChange={(text) => onTextChange?.(text)}
          />
        ) : (
          question.options.map((option) => (
            <QuizOptionButton
              key={option.id}
              label={option.text}
              selected={selectedOptionIds.includes(option.id)}
              onClick={() => onToggle(option.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
