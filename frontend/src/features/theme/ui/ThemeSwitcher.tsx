import { VerticalSelect } from "@/shared/components";
import Sun from "@/shared/assets/icons/sun.svg?react";
import Moon from "@/shared/assets/icons/moon.svg?react";
import Phone from "@/shared/assets/icons/phone.svg?react";
import { useThemeStore } from "../model/themeStore";
import type { Theme } from "../model/types";
import { useTranslation } from "react-i18next";

export const ThemeSwitcher = () => {
  const { t } = useTranslation();
  const { theme, setTheme } = useThemeStore();
  const options: { id: Theme; icon: React.ReactNode; label: string }[] = [
    { id: "light", icon: <Sun />, label: t("theme.light") },
    { id: "dark", icon: <Moon />, label: t("theme.dark") },
    { id: "system", icon: <Phone />, label: t("theme.system") },
  ];
  return <VerticalSelect options={options} value={theme} onChange={setTheme} />;
};
