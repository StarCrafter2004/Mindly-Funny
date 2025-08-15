import { PricingCard } from "./PricingCard";
import { useEffect, useState, type FC } from "react";
import { requestInvoice } from "@/features/payment";

import { useTranslation } from "react-i18next";
import { useProfileStore } from "@/entities/user/model/fillProfileStore";
import { useTonPay } from "@/features/payment/model/requestInvoice";
import { useConfigStore } from "@/shared/config/appConfigStore";
import { Select } from "@/shared/components";

type LivesCardProps = {
  onClose: () => void;
};

export const LivesCard: FC<LivesCardProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { pay } = useTonPay();

  const [selectedLives, setSelectedLives] = useState<string>("1");
  const [costStars, setCostStars] = useState<number>(0);
  const [costTon, setCostTon] = useState<number>(0);

  // Берём цены из конфигурации
  const livesCostStars1 = useConfigStore((store) => store.livesCostStars1);
  const livesCostStars3 = useConfigStore((store) => store.livesCostStars3);
  const livesCostStars5 = useConfigStore((store) => store.livesCostStars5);

  const livesCostTon1 = useConfigStore((store) => store.livesCostTon1);
  const livesCostTon3 = useConfigStore((store) => store.livesCostTon3);
  const livesCostTon5 = useConfigStore((store) => store.livesCostTon5);

  const fetchProfile = useProfileStore((store) => store.fetchProfile);

  // Обновляем цену при смене выбранного количества жизней
  useEffect(() => {
    switch (selectedLives) {
      case "1":
        setCostStars(livesCostStars1 || 0);
        setCostTon(livesCostTon1 || 0);
        break;
      case "3":
        setCostStars(livesCostStars3 || 0);
        setCostTon(livesCostTon3 || 0);
        break;
      case "5":
        setCostStars(livesCostStars5 || 0);
        setCostTon(livesCostTon5 || 0);
        break;
      default:
        setCostStars(0);
        setCostTon(0);
    }
  }, [
    selectedLives,
    livesCostStars1,
    livesCostStars3,
    livesCostStars5,
    livesCostTon1,
    livesCostTon3,
    livesCostTon5,
  ]);
  const buyWithStars = async () => {
    if (!costStars) return;
    const status = await requestInvoice({
      title: "Lives",
      description: `Buy ${selectedLives} lives`,
      amount: costStars,
      type: "lives",
      quantity: Number(selectedLives),
    });
    if (status === "paid") {
      fetchProfile();
      onClose();
    }
  };

  const buyWithTon = async () => {
    if (!costTon) return;
    const res = await pay({
      amount: costTon,
      type: "lives",
      quantity: Number(selectedLives),
    });
    if (res.status === "paid") {
      fetchProfile();
      onClose();
    }
  };

  return (
    <PricingCard
      onStars={buyWithStars}
      onTon={buyWithTon}
      text={t("pricingCard.buyLives")}
      stars={costStars}
      ton={costTon}
      onClose={onClose}
    >
      <div className="bg-surface-primary border-outline-secondary mb-[16px] flex flex-col rounded-[16px] border-[1.5px] p-[16px]">
        <Select
          className="mb-[4px]"
          options={[
            { id: "1", label: `1 ${t("main.live")}` },
            { id: "3", label: `3 ${t("main.lives")}` },
            { id: "5", label: `5 ${t("main.lives")}` },
          ]}
          value={selectedLives}
          onChange={(val) => setSelectedLives(val)}
        />
      </div>
    </PricingCard>
  );
};
