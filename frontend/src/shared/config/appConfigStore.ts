import { create } from "zustand";
import { api } from "../api/axiosInstance"; // путь замени на актуальный, если отличается

interface AppConfig {
  premiumCostStars: number;
  premiumCostTon: number;
  referalsText: string;
}

interface ConfigStore {
  premiumCostStars: number | null;
  premiumCostTon: number | null;
  referalsText: string | null;
  isLoaded: boolean;
  error: string | null;
  loadConfig: () => Promise<void>;
}

export const useConfigStore = create<ConfigStore>((set) => ({
  premiumCostStars: null,
  premiumCostTon: null,
  referalsText: null,
  isLoaded: false,
  error: null,

  loadConfig: async () => {
    try {
      const { data } = await api.get<{
        data: AppConfig;
      }>("/api/app-config");
      console.log("data", data);
      set({
        premiumCostStars: data.data.premiumCostStars,
        premiumCostTon: data.data.premiumCostTon,
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
}));
