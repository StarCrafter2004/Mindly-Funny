import type { FC, HTMLAttributes } from "react";
import Star from "@/shared/assets/icons/star.svg?react";
import Ton from "@/shared/assets/icons/ton.svg?react";
import Clock from "@/shared/assets/icons/clock.svg?react";
import CircleInfo from "@/shared/assets/icons/circle-info.svg?react";
import Calendar from "@/shared/assets/icons/calendar.svg?react";

type TestCardProps = {
  name?: string;
  description?: string;
  completeDate?: string;
  stars?: number | null;
  ton?: number | null;
  time?: number;
  iq?: number;
} & HTMLAttributes<HTMLDivElement>;

export const TestCard: FC<TestCardProps> = ({
  name,
  description,
  completeDate,
  stars,
  ton,
  time,
  iq,
  className = "",
  ...rest
}) => {
  const formattedDate = completeDate
    ? new Date(completeDate).toLocaleDateString("ru-RU")
    : null;

  return (
    <div
      className={`border-outline-secondary bg-surface-primary flex w-full flex-col rounded-[16px] border-[1.5px] p-[16px] transition ${className}`}
      {...rest}
    >
      <div className="text-text-primary mb-[4px] text-[18px] font-semibold">
        {name}
      </div>
      <div className="text-text-secondary mb-[12px] text-[16px] font-normal">
        {description}
      </div>
      <div className="flex flex-row flex-wrap gap-[8px]">
        {formattedDate && (
          <div className="bg-surface-secondary flex flex-row items-center gap-[4px] rounded-[12px] p-[8px]">
            <Calendar className="text-dimmed-primary h-[24px] w-[24px]" />
            <div className="text-dimmed-primary text-[16px] font-normal">
              {formattedDate}
            </div>
          </div>
        )}
        {stars != null && (
          <div className="bg-star/20 flex flex-row items-center gap-[4px] rounded-[12px] p-[8px]">
            <Star className="h-[24px] w-[24px]" />
            <div className="text-star text-[16px] font-normal">{stars}</div>
          </div>
        )}
        {ton != null && (
          <div className="bg-ton-blue/20 flex flex-row items-center gap-[4px] rounded-[12px] p-[8px]">
            <Ton className="h-[24px] w-[24px]" />
            <div className="text-ton-blue text-[16px] font-normal">{ton}</div>
          </div>
        )}
        {time != null && (
          <div className="bg-surface-secondary flex flex-row items-center gap-[4px] rounded-[12px] p-[8px]">
            <Clock className="text-dimmed-primary h-[24px] w-[24px]" />
            <div className="text-text-secondary text-[16px] font-normal">
              {time} minutes
            </div>
          </div>
        )}
        {iq != null && (
          <div className="bg-surface-secondary flex flex-row items-center gap-[4px] rounded-[12px] p-[8px]">
            <CircleInfo className="text-dimmed-primary h-[24px] w-[24px]" />
            <div className="text-text-secondary text-[16px] font-normal">
              {iq} IQ
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
