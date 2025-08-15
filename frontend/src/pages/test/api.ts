import { api } from "@/shared/api/axiosInstance";
import { useUserStore } from "@/entities/user";
import type { TestResultPayload } from "@/entities/test";

export async function getTestResultByTelegramAndTestId({
  telegram_id,
  testId,
}: TestResultPayload) {
  const res = await api.get(
    `/api/test-results?filters[telegram_id][$eq]=${telegram_id}&filters[testId][$eq]=${testId}`,
  );
  return res.data.data[0] ?? null;
}

export async function getTestIQPercentile(
  testId: string,
  iqThreshold: number,
): Promise<number> {
  // 1) Параллельно выполняем оба запроса
  const [totalRes, ltRes] = await Promise.all([
    api.get<{ meta: { pagination: { total: number } } }>(
      `/api/test-results?filters[testId][$eq]=${testId}&pagination[pageSize]=1`,
    ),
    api.get<{ meta: { pagination: { total: number } } }>(
      `/api/test-results?filters[testId][$eq]=${testId}&filters[iq][$lt]=${iqThreshold}&pagination[pageSize]=1`,
    ),
  ]); //  [oai_citation:0‡stackoverflow.com](https://stackoverflow.com/questions/52669596/promise-all-with-axios?utm_source=chatgpt.com)

  const total = totalRes.data.meta.pagination.total;
  const lowerCount = ltRes.data.meta.pagination.total;

  if (total === 1) {
    return 100;
  }
  const pct = total === 0 ? 0 : (lowerCount / (total - 1)) * 100;

  return Math.round(pct);
}

export async function getCountByRegion(
  testId: string,
  iqThreshold: number,
  country: string,
): Promise<number> {
  // 1) Параллельно выполняем оба запроса

  const res = await api.get<{ percent: number }>(
    "/api/test-results/count-by-region",
    {
      params: {
        testId,
        iq: iqThreshold,
        country,
      },
    },
  );

  return res.data.percent;
}

export async function getCountByAge(
  testId: string,
  iqThreshold: number,
  age: string,
): Promise<number> {
  const res = await api.get<{ percent: number }>(
    "/api/test-results/count-by-age",
    {
      params: {
        testId,
        iq: iqThreshold,
        age,
      },
    },
  );

  return res.data.percent;
}

export async function getCountByProfession(
  testId: string,
  iqThreshold: number,
  profession: string,
): Promise<number> {
  const res = await api.get<{ percent: number }>(
    "/api/test-results/count-by-profession",
    {
      params: {
        testId,
        iq: iqThreshold,
        profession,
      },
    },
  );

  return res.data.percent;
}

export async function getCelebrityStats(
  iqThreshold: number,
): Promise<{ iq: number; name: string }> {
  const res = await api.get<{ data: { iq: number; name: string } }>(
    "/api/test-results/count-by-celebrity",
    {
      params: {
        iq: iqThreshold,
      },
    },
  );

  return res.data.data;
}

export async function getFreeResult(testId?: string) {
  const userId = useUserStore.getState().user?.id;
  const res = await api.post(`/api/purchases/client`, {
    data: { userId, type: "result", extra: testId },
  });
  return res.data.data.documentId;
}

export const decrementLife = async () => {
  const res = await api.post<{ data: { lives: number } }>(
    `/api/decrement-life`,
  );
  return res.data.data.lives;
};
