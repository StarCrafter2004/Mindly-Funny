import { UserInfo } from "@/entities/user";
import { OffersSlider } from "@/widgets/offersSlider";
import { Invitations } from "@/features/invitations/ui/Invitations";
import { TestList } from "@/features/complitedTests";
import { SecondaryButton } from "@/shared/components";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PremiumCard } from "@/widgets/pricingCard";
import { useProfileStore } from "@/entities/user/model/fillProfileStore";

export const Profile = () => {
  const isPremium = useProfileStore((store) => store.isPremium);
  const { t } = useTranslation();
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState<boolean>(false);

  return (
    <div className="bg-surface-primary min-h-screen w-full overflow-y-auto pb-[96px]">
      <div className="flex flex-col gap-[24px] py-[16px]">
        <div className="px-[16px]">
          <UserInfo />
        </div>

        {!isPremium && (
          <OffersSlider
            showPremium={true}
            onBuyPremium={() => setIsPremiumModalOpen(true)}
          />
        )}
        <div className="px-[16px]">
          <div>
            <TestList />
          </div>
        </div>
        <div className="px-[16px]">
          <div>
            <Invitations />
            <Link to="invitations">
              <SecondaryButton className="h-[64px] w-full rounded-[16px]">
                {t("profile.viewAll")}
              </SecondaryButton>
            </Link>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isPremiumModalOpen && (
          <>
            {/* Полупрозрачный фон */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPremiumModalOpen(false)}
            />

            {/* Модалка снизу */}
            <motion.div
              className="fixed right-0 bottom-0 left-0 z-50"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <PremiumCard
                onClose={() => {
                  setIsPremiumModalOpen(false);
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
