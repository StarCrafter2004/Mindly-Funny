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
  initDataRaw?: string;
  isReady: boolean;
};

// ⛑️ Типизация вручную

const launchParams = retrieveLaunchParams(true);
const initDataRaw = retrieveRawInitData();

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
  isReady,
  initDataRaw,
}));
