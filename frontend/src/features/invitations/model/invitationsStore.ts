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
  freeReportsCounter: number;
  freeTestsCounter: number;
  FreeReportCost: number;
  FreeTestCost: number;
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
  freeTestsCounter: 0,
  freeReportsCounter: 0,
  FreeReportCost: 0,
  FreeTestCost: 0,
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
          freeReportsCounter: counters.freeReportsCounter,
          freeTestsCounter: counters.freeTestsCounter,
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
      FreeReportCost: res.FreeReportCost,
      FreeTestCost: res.FreeTestCost,
    });
  },
  clear: () => {
    set({ invitations: [], error: null });
  },
}));
