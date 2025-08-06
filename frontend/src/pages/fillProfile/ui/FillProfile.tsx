import { Dropdown, PrimaryButton, Select } from "@/shared/components";
import { useTranslation } from "react-i18next";
import ChevronRight from "@/shared/assets/icons/chevron-right.svg?react";
import { Link, useNavigate } from "react-router";
import { useProfileStore } from "../../../entities/user/model/fillProfileStore";
import { useIsProfileComplete } from "../lib/useIsProfileComplete";
import { useEffect, useState } from "react";
import {
  clearCustomBackHandler,
  setCustomBackHandler,
} from "@/shared/lib/back-handler";
import { ExitTestModal } from "@/widgets/modal";
import { useTestStore } from "@/entities/test/model/testStore";
import { useUserStore } from "@/entities/user";

export const FillProfile = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const userId = useUserStore((store) => store.user)?.id;
  const fetchProfile = useProfileStore((store) => store.fetchProfile);

  const editedSex = useProfileStore((store) => store.editedSex);
  const editedAge = useProfileStore((store) => store.editedAge);
  const editedProfession = useProfileStore((store) => store.editedProfession);
  const editedCountry = useProfileStore((store) => store.editedCountry);

  const setEditedSex = useProfileStore((store) => store.setEditedSex);
  const setEditedAge = useProfileStore((store) => store.setEditedAge);
  const updateProfile = useProfileStore((store) => store.updateProfile);
  const documentId = useProfileStore((store) => store.id);
  const isComplete = useIsProfileComplete();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [exitModalOpen, setExitModalOpen] = useState<boolean>(false);
  const setDefault = useTestStore((store) => store.setDefault);
  const redirectToAfterFill = useProfileStore(
    (store) => store.redirectToAfterFill,
  );
  const setRedirectToAfterFill = useProfileStore(
    (store) => store.setRedirectToAfterFill,
  );

  const options = [
    { id: "0-13", label: "0-13" },
    { id: "13-16", label: "13–16" },
    { id: "17-23", label: "17–23" },
    { id: "24-35", label: "24–35" },
    { id: "36-60", label: "36–60" },
    { id: "60+", label: "60+" },
    { id: "notSet", label: t("fillProfile.notSet") },
  ];

  const handleSubmit = () => {
    setIsSubmitting(true);
    updateProfile({
      id: documentId,
      sex: editedSex,
      age: editedAge,
      profession: editedProfession,
      country: editedCountry,
    }).finally(async () => {
      if (userId) {
        await fetchProfile();
      }

      setIsSubmitting(false);
      if (redirectToAfterFill) {
        const to = redirectToAfterFill;
        setRedirectToAfterFill(null);
        navigate(to);
      } else {
        navigate("/profile");
      }
    });
  };

  useEffect(() => {
    if (redirectToAfterFill) {
      setCustomBackHandler(() => setExitModalOpen(true));
      return clearCustomBackHandler;
    }
  }, [redirectToAfterFill]);

  return (
    <div className="bg-surface-primary relative h-[100dvh] w-full overflow-y-auto">
      <div className="p-[16px]">
        <div className="text-text-primary text-[18px] font-semibold">
          {t("fillProfile.title")}
        </div>
        <div className="text-text-secondary mb-[12px] text-[16px] font-normal">
          {t("fillProfile.description")}
        </div>
        <div className="flex flex-col gap-[4px]">
          <Select
            options={[
              { id: "notSet", label: t("fillProfile.notSet") },
              { id: "male", label: t("fillProfile.male") },
              { id: "female", label: t("fillProfile.female") },
            ]}
            value={editedSex}
            onChange={setEditedSex}
          />
          <Dropdown
            onSelect={setEditedAge}
            value={
              options.find((option) => option.id === editedAge)?.label ?? null
            }
            options={options}
            trigger={t("fillProfile.age")}
          />
          <Link
            to="/profile/fill/profession"
            className={`border-outline-secondary flex items-center justify-between rounded-[16px] border-[1.5px] p-[16px] ${!editedProfession ? "text-text-secondary text-[16px] font-normal" : "text-text-primary font-medium"}`}
          >
            {editedProfession
              ? t(`professions.${editedProfession}`)
              : t("fillProfile.profession")}
            <ChevronRight className="w-[24px]" />
          </Link>
          <Link
            to="/profile/fill/country"
            className={`border-outline-secondary flex items-center justify-between rounded-[16px] border-[1.5px] p-[16px] ${!editedCountry ? "text-text-secondary text-[16px] font-normal" : "text-text-primary font-medium"}`}
          >
            {editedCountry
              ? t(`countries.${editedCountry}`)
              : t("fillProfile.country")}
            <ChevronRight className="w-[24px]" />
          </Link>
        </div>
      </div>
      <div className="fixed bottom-[48px] w-full px-[16px]">
        <PrimaryButton
          onClick={handleSubmit}
          disabled={!isComplete || isSubmitting}
          className="w-full rounded-[16px] p-[18px] text-[16px]"
        >
          {t("fillProfile.save")}
        </PrimaryButton>
      </div>
      {exitModalOpen && { redirectToAfterFill } && (
        <ExitTestModal
          onExit={setDefault}
          onClose={() => setExitModalOpen(false)}
        />
      )}
    </div>
  );
};
