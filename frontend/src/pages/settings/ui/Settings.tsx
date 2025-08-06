import Flag from "@/shared/assets/icons/flag.svg?react";
import Sun from "@/shared/assets/icons/sun.svg?react";
import Moon from "@/shared/assets/icons/moon.svg?react";
import Shield from "@/shared/assets/icons/shield.svg?react";
import Document from "@/shared/assets/icons/document.svg?react";
import Chat from "@/shared/assets/icons/chat.svg?react";
import ChevronRight from "@/shared/assets/icons/chevron-right.svg?react";
import { useLanguageStore } from "@/features/language/model/languageStore";
import { useThemeStore } from "@/features/theme";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";

export const Settings = () => {
  const { t } = useTranslation();
  const language = useLanguageStore((store) => store.language);
  const resolvedTheme = useThemeStore((store) => store.resolvedTheme);

  return (
    <div className="bg-surface-primary h-[100dvh] w-full overflow-y-auto">
      <div className="p-[16px]">
        <div className="text-text-primary mb-[12px] text-[24px] font-semibold">
          {t("settings.title")}
        </div>
        <div className="border-outline-secondary text-text-primary mb-[24px] rounded-[16px] border-[1.5px]">
          <Link
            to="language"
            className="border-outline-secondary flex justify-between border-b-[1.5px] p-[16px]"
          >
            <div className="flex gap-[8px]">
              <Flag className="w-[24px]" />
              <div>{t("settings.language")}</div>
            </div>
            <div className="text-text-secondary flex gap-[8px] text-[16px] font-normal">
              <div>{language}</div>
              <ChevronRight />
            </div>
          </Link>
          <Link to="theme" className="flex justify-between p-[16px]">
            <div className="flex gap-[8px]">
              {resolvedTheme === "light" ? (
                <Sun className="w-[24px]" />
              ) : (
                <Moon className="w-[24px]" />
              )}
              <div>{t("settings.theme")}</div>
            </div>
            <div className="text-text-secondary flex gap-[8px] text-[16px] font-normal">
              <div>{t(`theme.${resolvedTheme}`)}</div>
              <ChevronRight />
            </div>
          </Link>
        </div>
        <div className="text-text-primary mb-[12px] text-[24px] font-semibold">
          {t("settings.importantLinks")}
        </div>
        <div className="border-outline-secondary text-text-primary rounded-[16px] border-[1.5px]">
          <a
            href="#"
            className="border-outline-secondary flex justify-between border-b-[1.5px] p-[16px]"
          >
            <div className="flex gap-[8px]">
              <Shield className="w-[24px]" />
              <div>{t("settings.privacyPolicy")}</div>
            </div>
            <div className="text-text-secondary flex gap-[8px] text-[16px] font-normal">
              <ChevronRight />
            </div>
          </a>
          <a
            href="#"
            className="border-outline-secondary flex justify-between border-b-[1.5px] p-[16px]"
          >
            <div className="flex gap-[8px]">
              <Document className="w-[24px]" />
              <div>{t("settings.userAgreement")}</div>
            </div>
            <div className="text-text-secondary flex gap-[8px] text-[16px] font-normal">
              <ChevronRight />
            </div>
          </a>
          <a href="#" className="flex justify-between p-[16px]">
            <div className="flex gap-[8px]">
              <Chat className="w-[24px]" />
              <div>{t("settings.contactUs")}</div>
            </div>
            <div className="text-text-secondary flex gap-[8px] text-[16px] font-normal">
              <ChevronRight />
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};
