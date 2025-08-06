import { Invitation } from "@/entities/invitation";
import { useTranslation } from "react-i18next";
import { useInvitationsStore } from "../model/invitationsStore";
import { useEffect } from "react";

export const Invitations = () => {
  const { t } = useTranslation();
  const invitations = useInvitationsStore((store) => store.invitations);

  const loadLastInvitations = useInvitationsStore(
    (store) => store.loadLastInvitations,
  );
  const loading = useInvitationsStore((store) => store.loadingProfile);

  useEffect(() => {
    loadLastInvitations();
  }, []);

  return (
    <div className="mb-[12px]">
      <div className="text-text-primary mb-[4px] text-[24px] font-semibold">
        {t("profile.invitations.title")}
      </div>
      <div className="text-text-secondary mb-[12px] max-w-[255px] text-[16px] font-normal">
        {t("profile.invitations.description")}
      </div>
      <div className="flex flex-col gap-[4px]">
        {loading ? (
          <>
            <div className="bg-outline-secondary h-[64px] w-full animate-pulse rounded-[16px]"></div>
            <div className="bg-outline-secondary h-[64px] w-full animate-pulse rounded-[16px]"></div>
            <div className="bg-outline-secondary h-[64px] w-full animate-pulse rounded-[16px]"></div>
          </>
        ) : (
          invitations.map((invitation) => (
            <Invitation
              name={invitation.firstName}
              invitationStatus={invitation.isUsed}
            />
          ))
        )}
      </div>
    </div>
  );
};
