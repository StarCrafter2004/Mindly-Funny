import { PricingCard } from "./PricingCard";
import { useEffect, useState, type FC } from "react";
import { requestInvoice } from "@/features/payment";

import free from "@/shared/assets/img/free.png";
import crown from "@/shared/assets/img/crown.png";
import reports from "@/shared/assets/img/reports.png";
import { useTranslation } from "react-i18next";
import { useProfileStore } from "@/entities/user/model/fillProfileStore";
import { useUserStore } from "@/entities/user";
import { useTonPay } from "@/features/payment/model/requestInvoice";
import { useConfigStore } from "@/shared/config/appConfigStore";
import { Select } from "@/shared/components";

type PricingCardProps = {
  onClose: () => void;
};

export const PremiumCard: FC<PricingCardProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { pay } = useTonPay();
  const [premiumDuration, setPremiumDuration] = useState<string>("1");
  const [premiumCostStars, setPremiumCostStars] = useState<number>(0);
  const [premiumCostTon, setPremiumCostTon] = useState<number>(0);
  useState<number>();
  const premiumCostStars1Month = useConfigStore(
    (store) => store.premiumCostStars1Month,
  );
  const premiumCostTon1Month = useConfigStore(
    (store) => store.premiumCostTon1Month,
  );

  const premiumCostStars6Month = useConfigStore(
    (store) => store.premiumCostStars6Month,
  );
  const premiumCostTon6Month = useConfigStore(
    (store) => store.premiumCostTon6Month,
  );
  const premiumCostStars12Month = useConfigStore(
    (store) => store.premiumCostStars12Month,
  );
  const premiumCostTon12Month = useConfigStore(
    (store) => store.premiumCostTon12Month,
  );

  console.log("=== Premium Debug Info ===");
  console.log("premiumDuration:", premiumDuration);
  console.log("premiumCostStars:", premiumCostStars);
  console.log("premiumCostTon:", premiumCostTon);

  console.log("premiumCostStars1Month:", premiumCostStars1Month);
  console.log("premiumCostTon1Month:", premiumCostTon1Month);

  console.log("premiumCostStars6Month:", premiumCostStars6Month);
  console.log("premiumCostTon6Month:", premiumCostTon6Month);

  console.log("premiumCostStars12Month:", premiumCostStars12Month);
  console.log("premiumCostTon12Month:", premiumCostTon12Month);
  console.log("==========================");

  const fetchProfile = useProfileStore((store) => store.fetchProfile);
  const userId = useUserStore((store) => store.user)?.id;
  const onStars = async () => {
    if (!premiumCostStars) return;
    const status = await requestInvoice({
      title: "Premium",
      description: "Buy Premium",
      amount: premiumCostStars,
      type: "premium",
      duration: Number(premiumDuration),
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
      duration: Number(premiumDuration),
    });
    if (res.status == "paid") {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await fetchProfile();
    }
    onClose();
  };

  useEffect(() => {
    if (
      premiumCostStars1Month &&
      premiumCostTon1Month &&
      premiumCostStars6Month &&
      premiumCostTon6Month &&
      premiumCostStars12Month &&
      premiumCostTon12Month
    ) {
      switch (premiumDuration) {
        case "1":
          setPremiumCostStars(premiumCostStars1Month);
          setPremiumCostTon(premiumCostTon1Month);
          break;
        case "6":
          setPremiumCostStars(premiumCostStars6Month);
          setPremiumCostTon(premiumCostTon6Month);
          break;
        case "12":
          setPremiumCostStars(premiumCostStars12Month);
          setPremiumCostTon(premiumCostTon12Month);
          break;
        default:
          setPremiumCostStars(0);
          setPremiumCostTon(0);
      }
    }
  }, [
    premiumDuration,
    premiumCostStars1Month,
    premiumCostTon1Month,
    premiumCostStars6Month,
    premiumCostTon6Month,
    premiumCostStars12Month,
    premiumCostTon12Month,
  ]);

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
      <Select
        className="mb-[4px]"
        options={[
          { id: "1", label: `1 ${t("pricingCard.month")}` },
          { id: "6", label: `6 ${t("pricingCard.months")}` },
          { id: "12", label: `1 ${t("pricingCard.year")}` },
        ]}
        value={premiumDuration}
        onChange={(val) => setPremiumDuration(val)}
      />
    </PricingCard>
  );
};
