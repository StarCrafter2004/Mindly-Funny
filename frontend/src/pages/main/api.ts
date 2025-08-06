import { useLanguageStore } from "@/features/language/model/languageStore";
import type { TestListResponse } from "./model/types";
import { api } from "@/shared/api/axiosInstance";

export const getTests = async (
  page: number = 1,
  filter: string = "all",
): Promise<TestListResponse> => {
  const locale = useLanguageStore.getState().language;
  if (filter === "purchased") {
    const res = await api.get<TestListResponse>(
      `/api/tests/purchased-tests?page=${page}&pageSize=6&locale=${locale}&filter=${filter}`,
    );
    return res.data;
  } else {
    const res = await api.get<TestListResponse>(
      `/api/tests/user-tests?page=${page}&pageSize=6&locale=${locale}&filter=${filter}`,
    );
    return res.data;
  }
};
