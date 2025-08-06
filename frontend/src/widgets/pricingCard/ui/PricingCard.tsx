import { type FC, type ReactNode } from "react";
import X from "@/shared/assets/icons/close.svg?react";
import Star from "@/shared/assets/icons/star.svg?react";
import Ton from "@/shared/assets/icons/ton.svg?react";
import { useTranslation } from "react-i18next";

type PricingCardProps = {
  onStars?: () => void;
  onTon?: () => void;
  stars?: number | null;
  ton?: number | null;
  onClose: () => void;
  children: ReactNode;
  text?: string;
  testId?: string;
};

const formatNumber = (num: number) => num.toLocaleString("ru-RU");

export const PricingCard: FC<PricingCardProps> = ({
  onStars,
  onTon,
  stars,
  ton,
  children,
  onClose,
  text = "Buy Test",
}) => {
  const { t } = useTranslation();

  const translatedText = text === "Buy Test" ? t("pricingCard.buyTest") : text;
  console.log("ton", ton);
  return (
    <div className="bg-surface-primary rounded-t-[24px] p-[16px]">
      <div className="w-full">
        <div className="mb-[12px] flex items-center justify-between">
          <div className="text-text-primary text-[24px] font-semibold">
            {translatedText}
          </div>
          <button
            onClick={onClose}
            className="bg-surface-secondary flex h-[48px] w-[48px] items-center justify-center rounded-[12px]"
          >
            <X className="text-outline-primary h-[24px] w-[24px]" />
          </button>
        </div>

        <div className="mb-[16px]">{children}</div>

        <div>
          {stars !== undefined && (
            <button
              onClick={onStars}
              className="bg-star/20 text-star mb-[4px] flex h-[60px] w-full items-center justify-center gap-[8px] rounded-[16px]"
            >
              <Star
                onClick={async () => {
                  if (onStars) {
                    onStars();
                  }
                }}
                className="w-[18px]"
              />
              <div className="translate-y-[1px]">
                {formatNumber(stars ?? 0)} Stars
              </div>
            </button>
          )}
          {ton !== undefined && (
            <button
              onClick={onTon}
              className="bg-ton-blue/20 text-ton-blue flex h-[60px] w-full items-center justify-center gap-[8px] rounded-[16px]"
            >
              <Ton className="w-[18px]" />
              <div className="translate-y-[1px]">{ton} Ton</div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
