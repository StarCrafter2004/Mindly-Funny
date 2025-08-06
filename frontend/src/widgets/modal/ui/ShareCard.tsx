import React, { type ReactNode } from "react";

export type ShareCardProps = {
  image: ReactNode;
  title: ReactNode;
  description: ReactNode;
};

export const ShareCard: React.FC<ShareCardProps> = ({
  image,
  title,
  description,
}) => {
  return (
    <div className="bg-surface-primary flex !w-fit max-w-[95%] flex-col items-center rounded-[16px] px-[36px] pt-[36px] pb-[16px] text-center">
      <div className="mb-[16px] flex h-[80px] w-[80px] justify-center">
        {" "}
        {image}
      </div>
      <div className="text-text-primary mb-[8px] text-[36px] leading-[36px] font-semibold whitespace-pre-line">
        {title}
      </div>
      <div className="text-text-secondary mb-[24px] text-[16px] leading-[24px] font-bold whitespace-pre-line">
        {description}
      </div>
    </div>
  );
};
