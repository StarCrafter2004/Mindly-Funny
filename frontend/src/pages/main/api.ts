import { useLanguageStore } from "@/features/language/model/languageStore";
import type { FilterListResponse, TestListResponse } from "./model/types";
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
  } else if (filter === "all" || filter === "paid") {
    const res = await api.get<TestListResponse>(
      `/api/tests/user-tests?page=${page}&pageSize=6&locale=${locale}&filter=${filter}`,
    );
    return res.data;
  } else {
    const res = await api.get<FilterListResponse>("/api/tests/client", {
      params: {
        filters: {
          filter: {
            $eq: filter, // значение, например 'completed'
          },
        },
        pagination: {
          page,
          pageSize: 6,
        },
        locale,
      },
    });
    console.log(res);
    return {
      data: res.data.data,
      pagination: {
        page: res.data.meta.pagination.page,
        pageSize: res.data.meta.pagination.pageSize,
        pageCount: res.data.meta.pagination.pageCount,
        hasNext: res.data.meta.pagination.page < res.data.meta.pagination.total,
      },
      lives: res.data.lives,
    };
  }
};
