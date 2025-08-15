import { create } from "zustand";
import { api } from "../api/axiosInstance"; // путь замени на актуальный, если отличается

interface AppConfig {
  premiumCostStars1Month: number | null;
  premiumCostTon1Month: number | null;
  premiumCostStars6Month: number | null;
  premiumCostTon6Month: number | null;
  premiumCostStars12Month: number | null;
  premiumCostTon12Month: number | null;

  livesCostStars1: number | null;
  livesCostStars3: number | null;
  livesCostStars5: number | null;
  livesCostTon1: number | null;
  livesCostTon3: number | null;
  livesCostTon5: number | null;

  referalsText: string;
}

interface ConfigStore {
  premiumCostStars1Month: number | null;
  premiumCostTon1Month: number | null;
  premiumCostStars6Month: number | null;
  premiumCostTon6Month: number | null;
  premiumCostStars12Month: number | null;
  premiumCostTon12Month: number | null;

  livesCostStars1: number | null;
  livesCostStars3: number | null;
  livesCostStars5: number | null;
  livesCostTon1: number | null;
  livesCostTon3: number | null;
  livesCostTon5: number | null;

  referalsText: string | null;

  filters: Array<{ name: string }>;
  isLoaded: boolean;
  error: string | null;
  loadConfig: () => Promise<void>;
  loadFilters: () => Promise<void>;
}

export const useConfigStore = create<ConfigStore>((set) => ({
  premiumCostStars1Month: null,
  premiumCostTon1Month: null,
  premiumCostStars6Month: null,
  premiumCostTon6Month: null,
  premiumCostStars12Month: null,
  premiumCostTon12Month: null,

  livesCostStars1: null,
  livesCostStars3: null,
  livesCostStars5: null,
  livesCostTon1: null,
  livesCostTon3: null,
  livesCostTon5: null,

  referalsText: null,
  isLoaded: false,
  error: null,
  filters: [],

  loadConfig: async () => {
    try {
      const { data } = await api.get<{
        data: AppConfig;
      }>("/api/app-config");
      console.log("data", data);
      set({
        premiumCostStars1Month: data.data.premiumCostStars1Month,
        premiumCostTon1Month: data.data.premiumCostTon1Month,
        premiumCostStars6Month: data.data.premiumCostStars6Month,
        premiumCostTon6Month: data.data.premiumCostTon6Month,
        premiumCostStars12Month: data.data.premiumCostStars12Month,
        premiumCostTon12Month: data.data.premiumCostTon12Month,

        livesCostStars1: data.data.livesCostStars1,
        livesCostStars3: data.data.livesCostStars3,
        livesCostStars5: data.data.livesCostStars5,
        livesCostTon1: data.data.livesCostTon1,
        livesCostTon3: data.data.livesCostTon3,
        livesCostTon5: data.data.livesCostTon5,

        referalsText: data.data.referalsText,
        isLoaded: true,
        error: null,
      });
    } catch (err: any) {
      set({
        error: err?.response?.data?.message || err.message || "Unknown error",
        isLoaded: false,
      });
    }
  },

  loadFilters: async () => {
    try {
      const res = await api.get<{ data: Array<{ name: string }> }>(
        "/api/filters",
      );
      set({ filters: res.data.data });
    } catch (err) {
      console.error(err);
    }
  },
}));
