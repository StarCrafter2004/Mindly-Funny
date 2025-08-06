import { Input, PrimaryButton, VerticalSelect } from "@/shared/components";
import { useState } from "react";
import { useProfileStore } from "../../../entities/user/model/fillProfileStore";
import { useNavigate } from "react-router";

import { useTranslation } from "react-i18next";

export const Country = () => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState<string>("");
  const country = useProfileStore((store) => store.editedCountry);
  const setCountry = useProfileStore((store) => store.setEditedCountry);
  const [rawCountry, setRawCountry] = useState(country);
  const normalizedInput = inputValue.trim().toLowerCase();
  const navigate = useNavigate();
  const countries = useProfileStore((store) => store.countries);

  const mappedOptions = countries.map((option) => ({
    id: option.name,
    label: t(`countries.${option.name}`),
  }));

  let filteredOptions = normalizedInput
    ? mappedOptions.filter(
        ({ id, label }) =>
          id.toLowerCase().includes(normalizedInput) ||
          label.toLowerCase().includes(normalizedInput),
      )
    : mappedOptions;

  if (filteredOptions.length === 0) {
    filteredOptions = mappedOptions;
  }

  const handleSelect = (country: string | null) => {
    setCountry(country);
    navigate(-1);
  };

  return (
    <div className="bg-surface-primary h-[100dvh] w-full overflow-y-auto">
      <div className="w-full p-[16px]">
        <div className="text-text-primary text-[24px] font-semibold">
          {t("country.title")}
        </div>
        <div className="text-text-secondary mb-[12px] text-[16px] font-normal">
          {t("country.description")}
        </div>

        <Input
          className="mb-[8px]"
          placeholder="Search"
          value={inputValue}
          onChange={setInputValue}
          isMagnifer={true}
        />
        <VerticalSelect
          options={filteredOptions}
          value={rawCountry}
          onChange={setRawCountry}
        />
      </div>
      <div className="fixed bottom-[48px] left-0 w-full px-[16px]">
        {country != rawCountry && (
          <PrimaryButton
            onClick={() => handleSelect(rawCountry)}
            className="text-text-inversed w-full rounded-[16px] p-[18px] text-[16px] font-medium"
          >
            {t("fillProfile.save")}
          </PrimaryButton>
        )}
      </div>
    </div>
  );
};
