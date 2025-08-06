import { Input, PrimaryButton, VerticalSelect } from "@/shared/components";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useProfileStore } from "../../../entities/user/model/fillProfileStore";
import { useNavigate } from "react-router";

export const Profession = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState<string>("");
  const profession = useProfileStore((store) => store.editedProfession);
  const setProfession = useProfileStore((store) => store.setEditedProfession);
  const [rawProfession, setRawProfession] = useState<string | null>(profession);
  const normalizedInput = inputValue.trim().toLowerCase();
  const professions = useProfileStore((store) => store.professions);

  const mappedOptions = professions.map((option) => ({
    id: option.name,
    label: t(`professions.${option.name}`),
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

  const handleSelect = (selected: string | null) => {
    setProfession(selected);
    navigate(-1);
  };

  return (
    <div className="bg-surface-primary h-[100dvh] w-full overflow-y-auto">
      <div className="w-full p-[16px]">
        <div className="text-text-primary text-[24px] font-semibold">
          {t("profession.title")}
        </div>
        <div className="text-text-secondary mb-[12px] text-[16px] font-normal">
          {t("profession.description")}
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
          value={rawProfession}
          onChange={setRawProfession}
        />
      </div>
      <div className="fixed bottom-[48px] left-0 w-full px-[16px]">
        {profession !== rawProfession && (
          <PrimaryButton
            onClick={() => handleSelect(rawProfession)}
            className="text-text-inversed w-full rounded-[16px] p-[18px] text-[16px] font-medium"
          >
            {t("fillProfile.save")}
          </PrimaryButton>
        )}
      </div>
    </div>
  );
};
