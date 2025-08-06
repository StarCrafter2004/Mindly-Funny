import { Invitation } from "@/entities/invitation";
import { useProfileStore } from "@/entities/user/model/fillProfileStore";
import {
  updateFreeReportCounter,
  updateFreeTestCounter,
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
  const freeReportsCounter = useInvitationsStore(
    (store) => store.freeReportsCounter,
  );
  const freeTestsCounter = useInvitationsStore(
    (store) => store.freeTestsCounter,
  );
  const loadConfig = useInvitationsStore((store) => store.loadConfig);
  const FreeReportCost = useInvitationsStore((store) => store.FreeReportCost);
  const FreeTestCost = useInvitationsStore((store) => store.FreeTestCost);

  const loadAllInvitations = useInvitationsStore(
    (store) => store.loadAllInvitations,
  );
  const loading = useInvitationsStore((store) => store.loadingPage);
  const [onReportLoading, setOnReportLoading] = useState<boolean>(false);
  const [onTestLoading, setOnTestLoading] = useState<boolean>(false);

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
                <ProgressBar
                  label={`📄 ${t("invitations.freeReport")}`}
                  max={FreeReportCost}
                  value={freeReportsCounter}
                  loading={onReportLoading}
                  onReward={() => {
                    setOnReportLoading(true);
                    updateFreeReportCounter()
                      .then(() =>
                        Promise.all([fetchProfile(), loadAllInvitations()]),
                      )
                      .finally(() => {
                        setOnReportLoading(false);
                      });
                  }}
                />
                <ProgressBar
                  label={`🧠 ${t("invitations.freeTest")}`}
                  max={FreeTestCost}
                  value={freeTestsCounter}
                  loading={onTestLoading}
                  onReward={() => {
                    setOnTestLoading(true);
                    updateFreeTestCounter()
                      .then(() =>
                        Promise.all([fetchProfile(), loadAllInvitations()]),
                      )
                      .finally(() => {
                        setOnTestLoading(false);
                        navigate("/main?filter=gift");
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
