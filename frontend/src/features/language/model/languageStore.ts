import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/shared/api/axiosInstance";
import i18n from "@/shared/config/i18n";
import type { Media } from "@/entities/test/model/types";

type LanguageOption = {
  label: string;
  code: string;
  icon: Media | null;
};

interface LanguageState {
  language: string;
  setLanguage: (language: string) => Promise<void>;
  options: LanguageOption[];
  fetchOptions: () => Promise<void>;
}

type Option = {
  code: string;
  name: string;
  image: Media;
};

type optionResponse = {
  data: Option[];
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      options: [],
      language: "en",
      fetchOptions: async () => {
        try {
          const res = await api.get<optionResponse>(
            "/api/custom-locales?populate=image&fields[0]=code&fields[1]=name",
          );

          const options: LanguageOption[] = res.data.data.map((item) => ({
            label: item.name,
            code: item.code,
            icon: item.image,
          }));

          set({ options });
        } catch (error) {
          console.error("Ошибка загрузки языков:", error);
        }
      },
      setLanguage: async (language) => {
        set({ language });
        await i18n.changeLanguage(language); // меняем язык i18n
      },
    }),
    {
      name: "language-storage", // ключ в localStorage
      onRehydrateStorage: () => (state) => {
        if (state?.language) {
          i18n.changeLanguage(state.language);
        }
      },
    },
  ),
);
