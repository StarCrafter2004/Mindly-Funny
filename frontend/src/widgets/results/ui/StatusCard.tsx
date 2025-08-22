import type { FC, ReactNode } from "react";

type StatusCardProps = {
  testName?: ReactNode;
  image?: ReactNode;
  status: string | null;
  description: string | null;
  className?: string;
};

export const StatusCard: FC<StatusCardProps> = ({
  testName,
  image,
  status,
  description,
  className,
}) => {
  return (
    <div
      className={`border-outline-secondary bg-surface-primary mb-[24px] flex flex-col rounded-[16px] border-[1.5px] ${className}`}
    >
      {testName && (
        <div className="border-outline-secondary text-text-primary n w-full rounded-t-[16px] border-b-[1.5px] p-[16px] text-[18px] font-semibold">
          {testName}
        </div>
      )}
      {image && (
        <div className="border-outline-secondary relative aspect-square w-full overflow-hidden border-b-[1.5px]">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Сюда придёт твой image */}
            <div className="h-full w-full object-cover">{image}</div>
          </div>
        </div>
      )}

      <div className="p-[16px]">
        {" "}
        <div className="text-text-primary mb-[4px] text-[18px] font-semibold">
          {status}
        </div>
        <div className="text-text-secondary mb-[4px] text-[16px] leading-[24px] font-normal">
          {description}
        </div>
      </div>
    </div>
  );
};
