import { create } from "zustand";
import { retrieveLaunchParams, retrieveRawInitData } from "@telegram-apps/sdk";

type User = {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  languageCode?: string;
  allowsWriteToPm?: boolean;
  photoUrl?: string;
};

type UserStore = {
  user: User | null;
  promo: string;
  testId: string;
  initDataRaw?: string;
  isReady: boolean;
};

const launchParams = retrieveLaunchParams(true);
const initDataRaw = retrieveRawInitData();
console.log(launchParams);

// Функция для декодирования base64 JSON из startapp
function parseStartAppBase64(param: string): Record<string, string> {
  if (!param) return {};
  try {
    // Для браузера: atob
    const json = atob(param);
    return JSON.parse(json);
  } catch (err) {
    console.error("Ошибка парсинга startParam base64 JSON:", err);
    return {};
  }
}

const startParam = launchParams.tgWebAppData?.startParam || "";
const parsedParams = parseStartAppBase64(startParam);

const rawUser = launchParams.tgWebAppData?.user as User | undefined;
let user: User | null = null;
let isReady = false;

if (rawUser) {
  user = {
    id: rawUser.id,
    firstName: rawUser.firstName,
    lastName: rawUser.lastName,
    username: rawUser.username,
    languageCode: rawUser.languageCode,
    allowsWriteToPm: rawUser.allowsWriteToPm,
    photoUrl: rawUser.photoUrl,
  };
  isReady = true;
}

export const useUserStore = create<UserStore>(() => ({
  user,
  promo: parsedParams.promo || "",
  testId: parsedParams.test || "",
  initDataRaw,
  isReady,
}));
