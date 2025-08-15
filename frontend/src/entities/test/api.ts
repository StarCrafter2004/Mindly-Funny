// shared/api/test.ts

import { useLanguageStore } from "@/features/language/model/languageStore";
import { type TestResponse, type TestResult } from "./model/types";
import type { AnswerRecord, TestResultPayload } from "@/entities/test";

import { api } from "@/shared/api/axiosInstance";
import { useUserStore } from "../user";

export const getTestByDocumentId = async (
  documentId: string,
): Promise<TestResponse> => {
  const locale = useLanguageStore.getState().language;
  const res = await api.get<TestResponse>(
    `/api/tests/${documentId}?populate[questions][populate]=answers&populate[Images][populate]=image&locale=${locale}`,
  );

  return res.data;
};

export const getTestByDocumentIdWithoutPopulate = async (
  documentId: string,
): Promise<TestResponse> => {
  const locale = useLanguageStore.getState().language;
  const res = await api.get<TestResponse>(
    `/api/tests/${documentId}?locale=${locale}`,
  );

  return res.data;
};

export const getTestByDocumentIdWithoutImages = async (
  documentId: string,
): Promise<TestResponse> => {
  const locale = useLanguageStore.getState().language;
  const res = await api.get<TestResponse>(
    `/api/tests/${documentId}?populate[questions][populate]=answers&locale=${locale}`,
  );
  return res.data;
};

export async function getTestResultByTelegramAndTestId({
  telegram_id,
  testId,
}: TestResultPayload) {
  const res = await api.get(
    `/api/test-results?filters[telegram_id][$eq]=${telegram_id}&filters[testId][$eq]=${testId}`,
  );
  return res.data.data[0] ?? null;
}

export async function existsTestResult({
  telegram_id,
  testId,
}: TestResultPayload) {
  const res = await api.get(
    `/api/test-results?filters[telegram_id][$eq]=${telegram_id}&filters[testId][$eq]=${testId}&fields=documentId`,
  );
  console.log("res", res);
  return res.data.data[0] ?? null;
}

export async function createTestResult(payload: TestResultPayload) {
  return await api.post("/api/test-results", {
    data: payload,
  });
}

export async function updateTestResult(id: number, payload: TestResultPayload) {
  return await api.put(`/api/test-results/${id}`, {
    data: payload,
  });
}

export async function createTestResultByDocumentId(
  testId: string | undefined,
  AnswerRecords: AnswerRecord[],
): Promise<void> {
  const telegram_id = useUserStore.getState().user?.id;

  if (!telegram_id || !testId) {
    throw new Error("telegram_id or testId is missing");
  }

  const payload = {
    telegram_id,
    testId,
    answerRecords: AnswerRecords,
  };
  const existing = await existsTestResult({
    telegram_id,
    testId,
  });
  console.log("existing", existing);
  try {
    if (existing) {
      await updateTestResult(existing.documentId, payload);
    } else {
      await createTestResult(payload);
    }
  } catch (err) {
    console.error(err);
  }
}

export async function gettestResult(documentId: string) {
  const locale = useLanguageStore.getState().language;
  const res = await api.get<{ data: TestResult }>(
    `/api/test-results/stats/${documentId}?locale=${locale}`,
  );
  return res.data.data;
}
