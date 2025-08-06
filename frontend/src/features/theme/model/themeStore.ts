import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Theme } from "./types";
import { retrieveLaunchParams } from "@telegram-apps/bridge";

type ThemeStore = {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
};

const launchParams = retrieveLaunchParams(true);

const bgColor = launchParams?.tgWebAppThemeParams?.bgColor;

function getResolvedThemeFromBgColor(color?: string): "light" | "dark" {
  if (!color) return "light";

  const hex = color.replace("#", "");
  if (hex.length !== 6) return "light"; // некорректный цвет

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;

  return luma < 128 ? "dark" : "light";
}

const initialResolvedTheme = getResolvedThemeFromBgColor(bgColor);

const defaultState: Omit<ThemeStore, "setTheme"> = {
  theme: "system",
  resolvedTheme: initialResolvedTheme,
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      ...defaultState,
      setTheme: (theme) => {
        const resolved = theme === "system" ? initialResolvedTheme : theme;

        set({ theme, resolvedTheme: resolved });
      },
    }),
    {
      name: "theme-storage", // ключ в localStorage
      // или sessionStorage
    },
  ),
);
