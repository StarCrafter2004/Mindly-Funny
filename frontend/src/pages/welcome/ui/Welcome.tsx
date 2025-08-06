import { useNavigate } from "react-router";
import welcome from "@/shared/assets/img/welcome.png";
import { PrimaryButton } from "@/shared/components";
import { useTranslation } from "react-i18next";

export const Welcome = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/main");
  };

  return (
    <div className="bg-surface-primary h-[100dvh] w-full overflow-y-auto">
      <div className="w-full p-[16px]">
        <img className="mb-[24px]" src={welcome} alt="" />
        <div className="px-[16px]">
          <div className="text-text-primary mb-[4px] text-[24px] font-semibold">
            {t("welcome.title")}
          </div>
          <div className="text-text-secondary mb-[24px] text-[16px] font-normal">
            {t("welcome.description")}
          </div>
          <PrimaryButton
            onClick={handleStart}
            className="h-[60px] w-full rounded-[16px]"
          >
            {t("welcome.start")}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};
