// LanguageSwitcher.tsx
import { Input, PrimaryButton, VerticalSelect } from "@/shared/components";
import { useState } from "react";

import { useLanguageStore } from "../model/languageStore";
import { api } from "@/shared/api/axiosInstance";
import { useTranslation } from "react-i18next";

export const LanguageSwitcher = () => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState<string>("");
  const { language, setLanguage } = useLanguageStore();
  const [rawLanguage, setRawLanguage] = useState<string>(language);
  const rawOptions = useLanguageStore((store) => store.options);
  const normalizedInput = inputValue.trim().toLowerCase();
  const baseUrl = api.defaults.baseURL as string;

  let filteredRawOptions = normalizedInput
    ? rawOptions.filter(
        ({ label, code }) =>
          label.toLowerCase().includes(normalizedInput) ||
          code.toLowerCase().includes(normalizedInput),
      )
    : rawOptions;
  if (filteredRawOptions.length === 0) {
    filteredRawOptions = rawOptions;
  }

  const options = filteredRawOptions.map((option) => ({
    id: option.code,
    icon: (
      <img src={baseUrl + option.icon?.url} className="h-[24px] w-[24px]" />
    ),
    label: (
      <div className="flex items-end gap-[4px]">
        <div>{option.label}</div>
        <div className="text-text-secondary relative translate-y-[3px] text-[12px] font-normal">
          ({option.code.toUpperCase()})
        </div>
      </div>
    ),
  }));

  return (
    <div className="">
      <Input
        className="mb-[8px]"
        placeholder="Search"
        value={inputValue}
        onChange={setInputValue}
        isMagnifer={true}
      />
      <VerticalSelect
        options={options}
        value={rawLanguage}
        onChange={setRawLanguage}
      />
      {language !== rawLanguage && (
        <div className="fixed bottom-[108px] left-0 w-full p-[16px]">
          <PrimaryButton
            onClick={() => setLanguage(rawLanguage)}
            className="text-text-inversed w-full rounded-[16px] p-[18px] text-[16px] font-medium"
          >
            {t("fillProfile.save")}
          </PrimaryButton>
        </div>
      )}
    </div>
  );
};
