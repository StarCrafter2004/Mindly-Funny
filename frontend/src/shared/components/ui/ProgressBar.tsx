import type { FC } from "react";
import { PrimaryButton } from "./PrimaryButton";
import { useTranslation } from "react-i18next";

type ProgressBarProps = {
  label?: string;
  value: number;
  max: number;
  loading: boolean;
  onReward: () => void;
};

export const ProgressBar: FC<ProgressBarProps> = ({
  label,
  value,
  max,
  onReward,
  loading,
}) => {
  const { t } = useTranslation();
  return (
    <div className="border-outline-secondary rounded-[16px] border-[1.5px] p-[16px]">
      <div className="text-text-primary mb-[12px] text-[18px] font-semibold">
        {label}
      </div>
      <div className="mb-[12px] flex items-center justify-between gap-[12px] py-[6px]">
        <div className="bg-surface-secondary h-[12px] flex-1 overflow-hidden rounded-[50px]">
          <div
            className="bg-surface-inversed h-full transition-all"
            style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
          ></div>
        </div>
        <div className="text-text-primary text-[16px] font-medium">
          {value}/{max}
        </div>
      </div>
      {value >= max && (
        <PrimaryButton
          disabled={loading}
          onClick={onReward}
          className="text-text-inversed rounded-[12px] px-[16px] py-[12px] text-[16px] font-medium"
        >
          {t("invitations.reward")}
        </PrimaryButton>
      )}
    </div>
  );
};
