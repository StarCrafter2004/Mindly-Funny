import type { AnswerRecord, Test } from "@/entities/test";

export type TestResult = {
  telegram_id: number;
  testId: string;
  AnswerRecords: AnswerRecord[];
  createdAt: string;
  iq: number;
};

export type TestResultResponse = {
  data: TestResult[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
};

export type TestResultWithTestInfo = {
  telegram_id: number;
  testId: string;
  AnswerRecords: AnswerRecord[];
  createdAt: string;
  iq: number;
  test: Test;
};
