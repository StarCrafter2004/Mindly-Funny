import { api } from "@/shared/api/axiosInstance";
import type {
  TestResult,
  TestResultResponse,
  TestResultWithTestInfo,
} from "./model/types";
import { getTestByDocumentIdWithoutPopulate } from "@/entities/test/api";

export const getTestResultsByTelegramId = async (
  telegramId: number,
): Promise<{ data: TestResult[]; meta: { pagination: { total: number } } }> => {
  const res = await api.get<TestResultResponse>(
    `/api/test-results?filters[telegram_id][$eq]=${telegramId}&sort=createdAt:desc&populate=answerRecords`,
  );

  return res.data;
};

export const getAllTestResultsWithTestInfo = async (
  telegramId: number,
): Promise<TestResultWithTestInfo[]> => {
  const results = await getTestResultsByTelegramId(telegramId);

  const settled = await Promise.allSettled(
    results.data.map(async (result) => {
      const test = await getTestByDocumentIdWithoutPopulate(result.testId);
      return {
        ...result,
        test: {
          ...test.data,
        },
      };
    }),
  );

  return settled
    .filter(
      (r): r is PromiseFulfilledResult<TestResultWithTestInfo> =>
        r.status === "fulfilled",
    )
    .map((r) => r.value);
};

export const getLastTestResultsByTelegramId = async (
  telegramId: number,
  limit: number = 3,
): Promise<{ data: TestResult[]; meta: { pagination: { total: number } } }> => {
  const res = await api.get<TestResultResponse>(
    `/api/test-results?filters[telegram_id][$eq]=${telegramId}&sort=createdAt:desc&pagination[limit]=${limit}&sort=createdAt:desc&populate=answerRecords`,
  );

  return res.data;
};

export const getLastTestResultsWithTestInfo = async (
  telegramId: number,
  limit: number = 3,
): Promise<{ data: TestResultWithTestInfo[]; total: number }> => {
  const results = await getLastTestResultsByTelegramId(telegramId, limit);

  const settled = await Promise.allSettled(
    results.data.map(async (result) => {
      const test = await getTestByDocumentIdWithoutPopulate(result.testId);
      return {
        ...result,
        test: {
          ...test.data,
        },
      };
    }),
  );

  const data = settled
    .filter(
      (r): r is PromiseFulfilledResult<TestResultWithTestInfo> =>
        r.status === "fulfilled",
    )
    .map((r) => r.value);

  return {
    data,
    total: results.meta.pagination.total,
  };
};
