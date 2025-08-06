import type { AnswerResult, Test } from "@/entities/test/model/types";
import type { TestResultWithTestInfo } from "../model/types";

/**
 * Возвращает массив результатов ответов по testId.
 * Если тест с таким ID не найден — возвращает пустой массив.
 */
export function getAnswerResultsByTestId(
  testResult: TestResultWithTestInfo,
  test: Test,
  timeLeft: string,
): AnswerResult[] {
  const { AnswerRecords } = testResult;

  return AnswerRecords.map((record) => {
    const question = test.questions[record.questionIndex];
    const userAnswer =
      record.answerIndex !== null
        ? question.answers[record.answerIndex]?.text
        : timeLeft;

    const correctAnswer = question.answers[record.correctAnswerIndex]?.text;

    return {
      question: question.text,
      userAnswer,
      correctAnswer,
      isCorrect: record.isCorrect,
    };
  });
}
