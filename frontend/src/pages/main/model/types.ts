import type { Test } from "@/entities/test";

export type TestPreview = Omit<Test, "questions">;

export type TestListResponse = {
  data: TestPreview[];
  lives: number;
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    hasNext: boolean;
  };
};

export type FilterListResponse = {
  data: TestPreview[];
  lives: number;
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: 1;
    };
  };
};
