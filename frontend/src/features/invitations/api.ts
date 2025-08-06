import { api } from "@/shared/api/axiosInstance";
import type { Referral, Invitation } from "./model/types";
import { useUserStore, type ProfileDataFromAPI } from "@/entities/user";

// 1) Получаем записи рефералов (любого типа)
export const getReferralsByReferrerId = async (
  referrerId: number,
): Promise<Referral[]> => {
  const res = await api.get<{ data: Referral[] }>(
    `/api/referrals?filters[referrer_id][$eq]=${referrerId}&sort=createdAt:desc`,
  );
  return res.data.data;
};

// 2) Для каждой записи запрашиваем профиль и собираем Invitation
export const getReferredProfiles = async (
  referrerId: number,
): Promise<Invitation[]> => {
  const referrals = await getReferralsByReferrerId(referrerId);

  const settled = await Promise.allSettled(
    referrals.map(async (ref): Promise<Invitation> => {
      const res = await api.get<{ data: ProfileDataFromAPI[] }>(
        `/api/t-users?filters[telegram_id][$eq]=${ref.user_id}`,
      );
      const profile = res.data.data[0];
      return {
        firstName: profile.firstName,
        lastName: profile.lastName,
        isUsed: ref.isUsed,
      };
    }),
  );

  // 3) Правильный фильтр:
  const success = settled.filter(
    (r): r is PromiseFulfilledResult<Invitation> => r.status === "fulfilled",
  );

  return success.map((r) => r.value);
};

export const getLastReferredProfiles = async (
  referrerId: number,
  limit = 3,
): Promise<Invitation[]> => {
  // 1) Запрашиваем последние рефералы, сортируя по дате создания DESC
  const referralRes = await api.get<{ data: Referral[] }>(
    `/api/referrals?filters[referrer_id][$eq]=${referrerId}&sort=createdAt:desc&pagination[limit]=${limit}`,
  );
  const referrals = referralRes.data.data;

  // 2) Параллельно запрашиваем профили и формируем приглашения
  const settled = await Promise.allSettled(
    referrals.map(async (ref): Promise<Invitation> => {
      const userRes = await api.get<{ data: ProfileDataFromAPI[] }>(
        `/api/t-users?filters[telegram_id][$eq]=${ref.user_id}`,
      );
      const profile = userRes.data.data[0];
      return {
        firstName: profile.firstName,
        lastName: profile.lastName,
        isUsed: ref.isUsed,
      };
    }),
  );

  // 3) Оставляем только успешные результаты
  const success = settled.filter(
    (r): r is PromiseFulfilledResult<Invitation> => r.status === "fulfilled",
  );

  // 4) Возвращаем массив готовых Invitation
  return success.map((r) => r.value);
};

export const getGiftsCounter = async () => {
  const userId = useUserStore.getState()?.user?.id;

  const res = await api.get<{
    data: { freeReportsCounter: number; freeTestsCounter: number }[];
  }>(
    `/api/t-users?filters[telegram_id][$eq]=${userId}&fields[0]=freeReportsCounter&fields[1]=freeTestsCounter`,
  );

  return res.data.data[0];
};

export const getConfig = async () => {
  const res = await api.get<{
    data: { FreeReportCost: number; FreeTestCost: number };
  }>(`/api/gift-config`);
  return res.data.data;
};

export const updateFreeReportCounter = async () => {
  const res = await api.post("/api/free-reports");
  return res;
};
export const updateFreeTestCounter = async () => {
  const res = await api.post("/api/free-tests");
  return res;
};
