// shared/api/test.ts

import { useLanguageStore } from "@/features/language/model/languageStore";
import { type TestResponse } from "./model/types";

import { api } from "@/shared/api/axiosInstance";

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
