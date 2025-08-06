import type { FC } from "react";
import Wallet from "@/shared/assets/icons/wallet.svg?react";
import Check from "@/shared/assets/icons/check.svg?react";

type InvitationProps = {
  name: string;
  invitationStatus: boolean;
};

export const Invitation: FC<InvitationProps> = ({ name, invitationStatus }) => {
  return (
    <div className="border-outline-secondary flex h-[64px] w-full items-center justify-between rounded-[16px] border-[1.5px] px-[16px]">
      <div className="text-text-primary text-[18px] font-semibold">{name}</div>
      {!invitationStatus ? (
        <div className="bg-dimmed-warning text-text-warning flex items-center gap-[4px] rounded-[12px] p-[8px] text-[16px] font-normal">
          <Check className="text-text-warning w-[24px]" />
          <div>Accepted</div>
        </div>
      ) : (
        <div className="bg-dimmed-success text-text-success flex gap-[4px] rounded-[12px] p-[8px] text-[16px] font-normal">
          <Wallet className="text-text-success w-[24px]" />
          <div>Purchased</div>
        </div>
      )}
    </div>
  );
};
