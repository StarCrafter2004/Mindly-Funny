import { create } from "zustand";

type AppStore = {
  shareImageReady: boolean;
  setShareImageReady: () => void;
};

export const useAppStore = create<AppStore>((set) => ({
  shareImageReady: false,
  setShareImageReady: () => set({ shareImageReady: true }),
}));
