import { SecondaryButton } from "@/shared/components";
import { useTranslation } from "react-i18next";
import { useUserStore } from "../model/userStore";
import { Link } from "react-router";
import { useState } from "react";
import { useProfileStore } from "../model/fillProfileStore";

import Edit from "@/shared/assets/icons/edit.svg?react";

export const UserInfo = () => {
  const user = useUserStore((store) => store.user);
  const [isImageLoaded, setIsImageLoaded] = useState<boolean>(false);
  const { t } = useTranslation();
  const isProfileComplete = useProfileStore((store) => store.isProfileComplete);
  const profession = useProfileStore((store) => store.profession);
  const country = useProfileStore((store) => store.country);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-[8px] h-[96px] w-[96px] overflow-hidden rounded-[50%]">
        {!isImageLoaded && (
          <div className="bg-outline-secondary h-full w-full animate-pulse" />
        )}
        <img
          src={user?.photoUrl}
          alt=""
          onLoad={() => setIsImageLoaded(true)}
          className={`${isImageLoaded ? "block" : "hidden"} h-full w-full object-cover`}
        />
      </div>
      <div
        className={`flex items-center justify-center gap-[8px] ${isProfileComplete ? "mb-[4px]" : "mb-[12px]"}`}
      >
        <div className="text-text-primary text-[24px] font-semibold">
          {user?.firstName} {user?.lastName}
        </div>
        {isProfileComplete && (
          <Link to="/profile/fill">
            <Edit className="text-dimmed-primary" />
          </Link>
        )}
      </div>

      {isProfileComplete ? (
        <div className="text-text-secondary flex flex-wrap items-center justify-center gap-[4px] text-[16px] font-normal">
          <div>{t(`professions.${profession}`)}, </div>
          <div> {t(`countries.${country}`)}</div>
        </div>
      ) : (
        <Link to="/profile/fill">
          <SecondaryButton className="h-[48px] w-auto rounded-[16px] px-[16px]">
            {t("profile.title")}
          </SecondaryButton>
        </Link>
      )}
    </div>
  );
};
