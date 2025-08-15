import { factories } from "@strapi/strapi";
import test from "../../test/controllers/test";

type Type = "status-with-threshold" | "status-per-answer";
export default factories.createCoreController("api::test-result.test-result", ({ strapi }) => ({
  async getTestResultWithStats(ctx) {
    const { id: documentId } = ctx.params;
    const locale = (ctx.query.locale as string) || "en";
    const userId = ctx.state.userId;

    // Получаем тест с нужной локалью
    const testResponse = await strapi.documents("api::test.test").findOne({
      documentId,
      populate: {
        questions: {
          populate: {
            answers: true,
          },
        },
        statuses: true,
        statusImages: {
          populate: {
            image: true,
          },
        },
        tresholds: true,
      },
      fields: "type",
      locale,
    });

    // Если не нашли тест — возвращаем 404, но без падения
    if (!testResponse) {
      return ctx.notFound("Test not found for the requested locale.");
    }

    const type = testResponse.type as Type;

    const testResult = await strapi.documents("api::test-result.test-result").findFirst({
      filters: {
        testId: documentId,
        telegram_id: userId,
      },
      populate: {
        answerRecords: true,
      },
    });

    if (!testResult) {
      return ctx.notFound("Test result not found.");
    }

    const questionAnswers = testResponse.questions.map((question, i) => {
      const userRecord = testResult.answerRecords[i];
      const userAnswer = question.answers?.[userRecord.answerIndex];
      const correctAnswer = question.answers?.find((a) => a.isCorrect);

      const base = {
        question: question.text,
        answer: userAnswer,
      };

      if (type === "status-with-threshold") {
        return {
          ...base,
          isCorrect: userAnswer?.isCorrect ?? false,
          correctAnswer: correctAnswer ?? null,
        };
      }

      return base;
    });

    let statusIndex = 0;

    if (type === "status-with-threshold") {
      const correctCount =
        testResult.answerRecords?.filter((r) => {
          const q = testResponse.questions![r.questionIndex!];
          const ans = q.answers?.[r.answerIndex!];
          return ans?.isCorrect;
        }).length ?? 0;

      const thresholds = testResponse.tresholds;

      statusIndex =
        thresholds?.reduce((acc, th) => {
          return correctCount >= th.minCorrect ? th.statusIndex : acc;
        }, 0) ?? 0;
    } else {
      const freq: Record<number, number> = {};
      testResult.answerRecords?.forEach((r) => {
        const q = testResponse.questions![r.questionIndex!];
        const ans = q.answers?.[r.answerIndex!];
        const idx = ans?.statusIndex;
        if (typeof idx === "number") {
          freq[idx] = (freq[idx] || 0) + 1;
        }
      });
      statusIndex = Object.entries(freq).reduce(
        (maxIdx, [idx, count]) => (count > (freq[maxIdx] || 0) ? Number(idx) : maxIdx),
        0
      );
    }

    const selectedStatus = testResponse.statuses?.find((s) => s.statusIndex === statusIndex);
    const selectedImage = testResponse.statusImages?.find((img) => img.index === statusIndex) ?? null;

    return {
      data: {
        status: selectedStatus?.name ?? "",
        description: selectedStatus?.description ?? "",
        type,
        questionAnswers,
        image: selectedImage?.image ?? null,
      },
    };
  },
}));
