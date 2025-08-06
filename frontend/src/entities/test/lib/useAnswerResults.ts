import { useTestStore } from "@/entities/test/model/testStore";
import type { AnswerResult } from "@/entities/test/model/types";
import { useTranslation } from "react-i18next";

export function useAnswerResults(): AnswerResult[] {
  const { t } = useTranslation();
  const answers = useTestStore((state) => state.answers);
  const questions = useTestStore((state) => state.questions);

  return answers.map((record) => {
    const question = questions[record.questionIndex];
    const userAnswer =
      record.answerIndex !== -1
        ? question.answers[record.answerIndex]?.text
        : t("results.timeLeft");
    const correctAnswer = question.answers[record.correctAnswerIndex]?.text;

    return {
      question: question.text,
      userAnswer,
      correctAnswer,
      isCorrect: record.isCorrect,
    };
  });
}
