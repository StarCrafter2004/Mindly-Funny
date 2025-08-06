import { PricingCard } from "./PricingCard";
import { type FC } from "react";
import { requestInvoice } from "@/features/payment";

import free from "@/shared/assets/img/free.png";
import crown from "@/shared/assets/img/crown.png";
import reports from "@/shared/assets/img/reports.png";
import { useTranslation } from "react-i18next";
import { useProfileStore } from "@/entities/user/model/fillProfileStore";
import { useUserStore } from "@/entities/user";
import { useTonPay } from "@/features/payment/model/requestInvoice";
import { useConfigStore } from "@/shared/config/appConfigStore";

type PricingCardProps = {
  onClose: () => void;
};

export const PremiumCard: FC<PricingCardProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { pay } = useTonPay();
  const premiumCostStars = useConfigStore((store) => store.premiumCostStars);
  const premiumCostTon = useConfigStore((store) => store.premiumCostTon);
  const fetchProfile = useProfileStore((store) => store.fetchProfile);
  const userId = useUserStore((store) => store.user)?.id;
  const onStars = async () => {
    if (!premiumCostStars) return;
    const status = await requestInvoice({
      title: "Premium",
      description: "Buy Premium",
      amount: premiumCostStars,
      type: "premium",
      duration: 1,
    });
    if (status === "paid") {
      if (userId) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        await fetchProfile();
      }
      onClose();
    }
  };
  const onTon = async () => {
    if (!premiumCostTon) return;
    const res = await pay({
      amount: premiumCostTon,
      type: "premium",
      duration: 1,
    });
    if (res.status == "paid") {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await fetchProfile();
    }
    onClose();
  };

  return (
    <PricingCard
      onStars={() => {
        onStars();
      }}
      onTon={() => {
        onTon();
      }}
      text={t("pricingCard.upgradePremium")}
      stars={premiumCostStars}
      ton={premiumCostTon}
      onClose={onClose}
    >
      <div className="bg-surface-primary border-outline-secondary mb-[16px] flex flex-col rounded-[16px] border-[1.5px]">
        <div className="border-outline-secondary border-b-[1.5px] p-[16px]">
          <div className="mb-[8px] w-[32px]">
            <img className="w-full" src={free} alt="" />
          </div>
          <div className="text-text-primary mb-[4px] text-[18px] font-semibold">
            {t("pricingCard.freeTests")}
          </div>
          <div className="text-text-secondary text-[16px] font-normal">
            {t("pricingCard.freeTestsDescription")}
          </div>
        </div>
        <div className="border-outline-secondary border-b-[1.5px] p-[16px]">
          <div className="mb-[8px] w-[32px]">
            <img className="w-full" src={reports} alt="" />
          </div>
          <div className="text-text-primary mb-[4px] text-[18px] font-semibold">
            {t("pricingCard.freeReports")}
          </div>
          <div className="text-text-secondary text-[16px] font-normal">
            {t("pricingCard.freeReportsDescription")}
          </div>
        </div>
        <div className="p-[16px]">
          <div className="mb-[8px] w-[32px]">
            <img className="w-full" src={crown} alt="" />
          </div>
          <div className="text-text-primar text-text-primary mb-[4px] text-[18px] font-semibold">
            {t("pricingCard.uniqueCrown")}
          </div>
          <div className="text-text-secondary text-[16px] font-normal">
            {t("pricingCard.uniqueCrownDescription")}
          </div>
        </div>
      </div>
    </PricingCard>
  );
};
