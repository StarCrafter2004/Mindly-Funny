import { LanguageSwitcher } from "@/features/language";

import { useTranslation } from "react-i18next";

export const LanguageSelect = () => {
  const { t } = useTranslation();

  return (
    <div className="relative h-[100dvh] pb-[212px]">
      <div className="bg-surface-primary w-full overflow-y-auto">
        <div className="w-full p-[16px]">
          <div className="text-text-primary text-[24px] font-semibold">
            {t("language.title")}
          </div>
          <div className="text-text-secondary mb-[12px] text-[16px] font-normal">
            {t("language.description")}
          </div>
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );
};
