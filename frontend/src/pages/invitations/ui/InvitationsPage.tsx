import { Invitation } from "@/entities/invitation";
import { useProfileStore } from "@/entities/user/model/fillProfileStore";
import {
  updateFreeLivesCounter,
  updateFreePremCounter,
} from "@/features/invitations/api";
import { useInvitationsStore } from "@/features/invitations/model/invitationsStore";
import { ProgressBar } from "@/shared/components";
import { OffersSlider } from "@/widgets/offersSlider";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

export const InvitationsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fetchProfile = useProfileStore((store) => store.fetchProfile);

  const invitations = useInvitationsStore((store) => store.invitations);
  const freePremiumCounter = useInvitationsStore(
    (store) => store.freePremiumCounter,
  );
  const freeLivesCounter = useInvitationsStore(
    (store) => store.freeLivesCounter,
  );

  const FreePremActivated = useProfileStore((store) => store.FreePremActivated);
  const setFreePremActivated = useProfileStore(
    (store) => store.setFreePremActivated,
  );

  const loadConfig = useInvitationsStore((store) => store.loadConfig);
  const FreeLivesCost = useInvitationsStore((store) => store.FreeLivesCost);
  const FreePremiumCost = useInvitationsStore((store) => store.FreePremiumCost);

  const loadAllInvitations = useInvitationsStore(
    (store) => store.loadAllInvitations,
  );
  const loading = useInvitationsStore((store) => store.loadingPage);
  const [onPremiumLoading, setOnPremiumtLoading] = useState<boolean>(false);
  const [onLivesLoading, setOnLivesLoading] = useState<boolean>(false);

  const onLoad = async () => {
    await loadConfig();
    await loadAllInvitations();
  };

  useEffect(() => {
    window.scrollTo({ top: 0 });
    onLoad();
  }, []);

  return (
    <div className="bg-surface-primary min-h-screen w-full overflow-y-auto">
      <div className="py-[16px]">
        <OffersSlider
          onBuyPremium={() => {}}
          className="mb-[4px]"
          showPremium={false}
        />
        <div className="px-[16px]">
          <div className="mb-[24px] flex flex-col gap-[4px]">
            {loading ? (
              <>
                <div className="bg-outline-secondary h-[110px] w-full animate-pulse rounded-[16px]"></div>
                <div className="bg-outline-secondary h-[110px] w-full animate-pulse rounded-[16px]"></div>
              </>
            ) : (
              <>
                {" "}
                {!FreePremActivated && (
                  <ProgressBar
                    label={`👑 ${t("invitations.freePremium")}`}
                    max={FreePremiumCost}
                    value={freePremiumCounter}
                    loading={onPremiumLoading}
                    onReward={async () => {
                      setOnPremiumtLoading(true);
                      await updateFreePremCounter()
                        .then((res) => {
                          setFreePremActivated(res);
                          Promise.all([fetchProfile(), loadAllInvitations()]);
                        })
                        .finally(() => {
                          setOnPremiumtLoading(false);
                        });
                    }}
                  />
                )}
                <ProgressBar
                  label={`💖 ${t("invitations.freeLives")}`}
                  max={FreeLivesCost}
                  value={freeLivesCounter}
                  loading={onLivesLoading}
                  onReward={() => {
                    setOnLivesLoading(true);
                    updateFreeLivesCounter()
                      .then(() =>
                        Promise.all([fetchProfile(), loadAllInvitations()]),
                      )
                      .finally(() => {
                        setOnLivesLoading(false);
                        navigate("/main?filter=all");
                      });
                  }}
                />
              </>
            )}
          </div>
          <div className="text-text-primary mb-[12px] text-[24px] font-semibold">
            {t("invitations.yourInvitations")}
          </div>
          <div className="flex flex-col gap-[4px]">
            {invitations.map((invitation) => (
              <Invitation
                name={invitation.firstName}
                invitationStatus={invitation.isUsed}
              />
            ))}
            {loading && (
              <>
                <div className="bg-outline-secondary h-[64px] w-full animate-pulse rounded-[16px]"></div>
                <div className="bg-outline-secondary h-[64px] w-full animate-pulse rounded-[16px]"></div>
                <div className="bg-outline-secondary h-[64px] w-full animate-pulse rounded-[16px]"></div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
