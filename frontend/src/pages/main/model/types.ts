import type { Test } from "@/entities/test";

export type TestPreview = Omit<Test, "questions">;

export type TestListResponse = {
  data: TestPreview[];

  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    hasNext: boolean;
  };
};
