import { useTranslation } from "react-i18next";
import Crown from "@/shared/assets/icons/crown.svg?react";
import type { FC } from "react";
import { openTelegramLink } from "@telegram-apps/sdk";
import { useUserStore } from "@/entities/user";
import { useConfigStore } from "@/shared/config/appConfigStore";

type OffersSliderProps = {
  onBuyPremium: () => void;
  showPremium: boolean;
  className?: string;
};

export const OffersSlider: FC<OffersSliderProps> = ({
  onBuyPremium,
  showPremium,
  className,
}) => {
  const { t } = useTranslation();
  const telegram_id = useUserStore().user?.id;
  const referalsText = useConfigStore((store) => store.referalsText);
  return (
    <div
      className={`scrollbar-hide flex gap-[4px] overflow-y-auto px-[16px] ${className}`}
    >
      {showPremium && (
        <div
          className={`bg-surface-primary border-outline-secondary flex w-[90%] shrink-0 flex-col items-start justify-between rounded-[16px] border-[1.5px] p-[16px]`}
        >
          <div>
            <div className="text-text-primary mb-[4px] text-[18px] font-semibold">
              🔓 {t("offersSlider.title")}
            </div>
            <div className="text-text-secondary mb-[12px] text-[16px] font-normal">
              {t("offersSlider.description")}
            </div>
          </div>

          <button
            onClick={onBuyPremium}
            className="bg-semantic-warning flex items-center justify-center gap-[8px] rounded-[12px] p-[16px] text-[16px] font-medium text-white"
          >
            <Crown className="w-[18px]" />
            <div>{t("offersSlider.buyPremium")}</div>
          </button>
        </div>
      )}
      <div
        className={`bg-surface-primary border-outline-secondary flex shrink-0 flex-col items-start justify-between rounded-[16px] border-[1.5px] p-[16px] ${showPremium ? "w-[90%]" : "w-full"}`}
      >
        <div>
          <div className="text-text-primary mb-[4px] text-[18px] font-semibold">
            🎁 {t("offersSlider.getFreePrem")}
          </div>
          <div className="text-text-secondary mb-[12px] text-[16px] font-normal">
            {t("offersSlider.freePremDescription")}
          </div>
        </div>
        <button
          onClick={() => {
            if (!referalsText) return;
            openTelegramLink(
              `https://t.me/share/url?url=https://t.me/funnyTestsBot?start=ref-${telegram_id}&text=${encodeURIComponent(referalsText)}`,
            );
          }}
          className="bg-surface-brand flex items-center justify-center rounded-[12px] p-[16px] text-[16px] font-medium text-white"
        >
          {t("offersSlider.invite")}
        </button>
      </div>
      <div
        className={`bg-surface-primary border-outline-secondary flex shrink-0 flex-col items-start justify-between rounded-[16px] border-[1.5px] p-[16px] ${showPremium ? "w-[90%]" : "w-full"}`}
      >
        <div>
          <div className="text-text-primary mb-[4px] text-[18px] font-semibold">
            💖 {t("offersSlider.getFreeLives")}
          </div>
          <div className="text-text-secondary mb-[12px] text-[16px] font-normal">
            {t("offersSlider.freeLivesDescription")}
          </div>
        </div>
        <button
          onClick={() => {
            if (!referalsText) return;
            openTelegramLink(
              `https://t.me/share/url?url=https://t.me/funnyTestsBot?start=ref-${telegram_id}&text=${encodeURIComponent(referalsText)}`,
            );
          }}
          className="bg-surface-brand flex items-center justify-center rounded-[12px] p-[16px] text-[16px] font-medium text-white"
        >
          {t("offersSlider.invite")}
        </button>
      </div>
    </div>
  );
};
