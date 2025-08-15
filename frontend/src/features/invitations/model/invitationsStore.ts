import { create } from "zustand";
import type { Invitation } from "./types";
import {
  getConfig,
  getLastReferredProfiles,
  getReferredProfiles,
} from "../api";
import { useUserStore } from "@/entities/user";
import { getGiftsCounter } from "../api";

interface InvitationsState {
  invitations: Invitation[];
  freeLivesCounter: number;
  freePremiumCounter: number;
  FreeLivesCost: number;
  FreePremiumCost: number;
  loadingProfile: boolean;
  loadingPage: boolean;
  error: string | null;
  loadLastInvitations: () => Promise<void>;
  loadAllInvitations: () => Promise<void>;
  loadConfig: () => Promise<void>;
  clear: () => void;
}

export const useInvitationsStore = create<InvitationsState>((set) => ({
  invitations: [],
  loadingProfile: true,
  loadingPage: true,
  error: null,
  freePremiumCounter: 0,
  freeLivesCounter: 0,
  FreeLivesCost: 0,
  FreePremiumCost: 0,

  loadLastInvitations: async () => {
    set({ loadingProfile: true, error: null });
    const telegramId = useUserStore.getState().user?.id;

    try {
      if (telegramId) {
        const invitations = await getLastReferredProfiles(telegramId);
        set({ invitations });
      }
    } catch (error) {
      set({ error: "Не удалось загрузить последние приглашения." });
    } finally {
      set({ loadingProfile: false });
    }
  },

  loadAllInvitations: async () => {
    set({ loadingPage: true, error: null });

    const telegramId = useUserStore.getState().user?.id;

    try {
      if (telegramId) {
        const invitations = await getReferredProfiles(telegramId);
        const counters = await getGiftsCounter();
        set({
          invitations,
          freePremiumCounter: counters.freePremiumCounter,
          freeLivesCounter: counters.freeLivesCounter,
        });
      }
    } catch (error) {
      set({ error: "Не удалось загрузить приглашения." });
    } finally {
      set({ loadingPage: false });
    }
  },
  loadConfig: async () => {
    const res = await getConfig();
    set({
      FreeLivesCost: res.FreeLivesCost,
      FreePremiumCost: res.FreePremiumCost,
    });
  },
  clear: () => {
    set({ invitations: [], error: null });
  },
}));
