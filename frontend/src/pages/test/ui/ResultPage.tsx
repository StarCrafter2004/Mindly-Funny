import { ResultsChart } from "@/features/results";
import { ResultsList } from "@/widgets/results";
import { useAnswerResults } from "@/entities/test";
import {
  setCustomBackHandler,
  clearCustomBackHandler,
} from "@/shared/lib/back-handler";
import { ExitTestModal, ShareModal } from "@/widgets/modal";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Trans, useTranslation } from "react-i18next";
import { PrimaryButton, SecondaryButton } from "@/shared/components";
import { useTestStore } from "@/entities/test/model/testStore";
import {
  createTestResultByDocumentId,
  getCelebrityStats,
  getCountByAge,
  getCountByProfession,
  getCountByRegion,
  getFreeResult,
  getTestIQPercentile,
} from "../api";
import { toast } from "react-toastify";
import { Statistics } from "@/widgets/statistics";
import { useProfileStore } from "@/entities/user/model/fillProfileStore";
import preparing from "@/shared/assets/img/preparing.png";
import Document from "@/shared/assets/icons/document.svg?react";
import { requestInvoice } from "@/features/payment";
import { AnimatePresence, motion } from "framer-motion";
import { PricingCard } from "@/widgets/pricingCard";
import { popup } from "@telegram-apps/sdk-react";

import crown from "@/shared/assets/img/crown.png";
import people from "@/shared/assets/img/man.png";
import star from "@/shared/assets/img/star.png";
import planet from "@/shared/assets/img/planet.png";
import cake from "@/shared/assets/img/cake.png";

export const ResultPage = () => {
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] =
    useState<boolean>(false);

  const setIsResultPurchased = useTestStore(
    (store) => store.setIsResultPurchased,
  );
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const resultsStars = useTestStore((store) => store.resultsStars);
  const resultsTon = useTestStore((store) => store.resultsTon);
  const [exitModalOpen, setExitModalOpen] = useState<boolean>(false);
  const { t } = useTranslation();
  const results = useAnswerResults();
  const RowAnswers = useTestStore((state) => state.answers);
  const navigate = useNavigate();
  const setDefault = useTestStore((store) => store.setDefault);
  const { id: documentId } = useParams<{ id: string }>();
  const [worldPercent, setWorldPercent] = useState<number | null>(null);
  const [professionPercent, setProfessionPercent] = useState<number | null>(
    null,
  );
  const [celebrity, setCelebrity] = useState<{ iq: number; name: string }>({
    iq: 0,
    name: "",
  });
  const [countryPercent, setCountryPercent] = useState<number | null>(null);
  const [agePercent, setAgePercent] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const profession = useProfileStore((store) => store.profession);
  const country = useProfileStore((store) => store.country);
  const age = useProfileStore((store) => store.age);
  const [error, setError] = useState<boolean>(false);
  const isResultPurchased = useTestStore((store) => store.isResultPurchased);
  const freeReports = useProfileStore((store) => store.freeReports);
  const fetchProfile = useProfileStore((store) => store.fetchProfile);
  const setResultPurchased = useTestStore((store) => store.setResultPurchased);

  if (error) {
    setDefault();
    navigate("/main");
    toast("error");
  }

  const iq =
    70 +
    Math.round(
      0.8 *
        100 *
        (RowAnswers.filter((answer) => answer.isCorrect).length /
          RowAnswers.length),
    );

  useEffect(() => {
    setLoading(true);
    const fetchResults = async () => {
      await createTestResultByDocumentId(documentId, RowAnswers, iq).catch(() =>
        toast("Failed to save your test result"),
      );

      if (documentId && profession && country && age) {
        Promise.all([
          getCelebrityStats(iq),
          getTestIQPercentile(documentId, iq),
          getCountByProfession(documentId, iq, profession),
          getCountByRegion(documentId, iq, country),
          getCountByAge(documentId, iq, age),
        ])
          .then(([celeb, world, prof, region, age]) => {
            setCelebrity(celeb);
            setWorldPercent(world);
            setProfessionPercent(prof);
            setCountryPercent(region);
            setAgePercent(age);
          })
          .catch(() => {
            setLoading(false);
            setError(true);
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        setLoading(false);
        setError(true);
      }
    };

    fetchResults();
    // Все 4 запроса одновременно

    setCustomBackHandler(async () => {
      if (popup.open.isAvailable()) {
        // popup.isOpened() -> false
        const result = await popup.show({
          title: t("modal.title"),
          message: t("modal.message"),
          buttons: [
            { id: "exit", type: "default", text: t("modal.exit") },
            { id: "cansel", type: "default", text: t("modal.cancel") },
          ],
        });
        if (result === "exit") {
          setDefault();
          navigate("/main");
        }
      } else {
        setExitModalOpen(true);
      }
    });

    return () => {
      clearCustomBackHandler();
    };
  }, []);

  return (
    <div className="px-[16px] pt-[16px] pb-[48px]">
      <div className="text-text-primary mb-[12px] text-[24px] font-semibold">
        {t("results.title")}
      </div>
      <ResultsChart iq={iq} percent={worldPercent} />
      <div className="mb-[12px] text-[24px] font-semibold">
        {t("results.statistics")}
      </div>
      {!isResultPurchased && (
        <PrimaryButton
          onClick={async () => {
            if (freeReports > 0) {
              try {
                const res = await getFreeResult(documentId);
                if (res) {
                  setLoading(true);
                  await fetchProfile();
                  setResultPurchased(true);
                  setLoading(false);
                }
              } catch (err) {
                console.log(err);
              }
            } else {
              setIsPurchaseModalOpen(true);
            }
          }}
          className="mb-[12px] w-full rounded-[16px] p-[18px] text-[16px] font-medium"
          icon={<Document className="text-red" />}
        >
          {freeReports > 0 ? t("results.getFree") : t("results.buy")}
        </PrimaryButton>
      )}
      {professionPercent != null &&
        countryPercent != null &&
        agePercent != null && (
          <Statistics
            celebrity={t(`celebrity.${celebrity.name}`)}
            celebrityIQ={celebrity.iq}
            professionPercent={professionPercent}
            countryPercent={countryPercent}
            agePercent={agePercent}
            isResultPurchased={isResultPurchased}
          />
        )}
      <div className="text-text-primary text- mb-[12px] text-[24px] font-semibold">
        {t("results.answers.title")}
      </div>
      <ResultsList
        isResultPurchased={isResultPurchased}
        className="mb-[32px]"
        results={results}
      />
      {exitModalOpen && (
        <ExitTestModal
          onClose={() => {
            setExitModalOpen(false);
          }}
          onExit={setDefault}
        />
      )}

      <PrimaryButton
        onClick={() => setIsShareModalOpen(true)}
        className="mb-[12px] w-full rounded-[16px] p-[18px]"
      >
        {t("results.share")}
      </PrimaryButton>

      <SecondaryButton
        onClick={() => {
          setDefault();
          navigate("/main");
        }}
        className="text-text-primary w-full rounded-[16px] p-[18px] text-[16px] font-medium"
      >
        {t("results.homeScreen")}
      </SecondaryButton>

      {loading && (
        <div className="bg-surface-primary fixed inset-0 z-50 flex w-full flex-col items-center justify-center">
          <img className="mb-[8px] w-[80%]" src={preparing} alt="" />
          <div className="text-text-primary mb-[4px] text-[24px] font-semibold">
            {t("results.preparing")}
          </div>
          <div className="text-text-secondary text-[16px] font-normal">
            {t("results.analyzing")}
          </div>
        </div>
      )}

      <AnimatePresence>
        {isPurchaseModalOpen && (
          <>
            {/* Полупрозрачный фон */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPurchaseModalOpen(false)}
            />

            {/* Модалка снизу */}
            <motion.div
              className="fixed right-0 bottom-0 left-0 z-50"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <PricingCard
                onStars={async () => {
                  if (resultsStars && documentId) {
                    const status = await requestInvoice({
                      title: "Results",
                      description: "Buy Results",
                      amount: resultsStars,
                      type: "result",
                      testId: documentId,
                    });
                    if (status === "paid") {
                      setIsResultPurchased(true);
                      setIsPurchaseModalOpen(false);
                    }
                  }
                }}
                stars={resultsStars}
                ton={resultsTon}
                onClose={() => {
                  setIsResultPurchased(true);
                  setIsPurchaseModalOpen(false);
                }}
              >
                Buy Results
              </PricingCard>
            </motion.div>
          </>
        )}
        {isShareModalOpen && (
          <>
            {/* Полупрозрачный фон */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Модалка снизу */}
            <motion.div
              className="fixed right-0 bottom-0 left-0 z-50"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <ShareModal
                options={[
                  {
                    image: <img className="w-full" src={crown} alt="" />,
                    title: (
                      <Trans
                        i18nKey="share.globalSmartIq"
                        values={{ iq }}
                        components={{
                          userIq: <span />,
                        }}
                      />
                    ),
                    description: (
                      <Trans
                        i18nKey="share.globalSmartPercent"
                        values={{ percent: worldPercent }}
                        components={{
                          percent: <span />,
                        }}
                      />
                    ),
                  },
                  {
                    image: <img className="w-full" src={people} alt="" />,
                    title: (
                      <Trans
                        i18nKey="share.professionSmartPercent"
                        values={{ percent: professionPercent }}
                        components={{
                          percent: (
                            <span className="text-text-primary font-medium" />
                          ),
                        }}
                      />
                    ),
                    description: (
                      <Trans
                        i18nKey="share.professionSmartIq"
                        values={{
                          iq,
                          profession: t(`professions.${profession}`),
                        }}
                        components={{
                          userIq: <span />,
                          profession: <span />,
                        }}
                      />
                    ),
                  },
                  {
                    image: <img className="w-full" src={star} alt="" />,
                    title: (
                      <Trans
                        i18nKey="share.celebritySmartHeader"
                        values={{ celebrity: t(`celebrity.${celebrity.name}`) }}
                        components={{
                          celebrity: <span />,
                        }}
                      />
                    ),
                    description: (
                      <Trans
                        i18nKey="share.celebritySmartText"
                        values={{
                          celebrity: t(`celebrity.${celebrity.name}`),
                          celebrityIq: celebrity.iq,
                          iq,
                        }}
                        components={{
                          celebrity: <span />,
                          celebrityIq: <span />,
                          userIq: <span />,
                        }}
                      />
                    ),
                  },
                  {
                    image: <img className="w-full" src={planet} alt="" />,
                    title: (
                      <Trans
                        i18nKey="share.countrySmartPercent"
                        values={{
                          percent: countryPercent,
                          country: t(`countries.${country}`),
                        }}
                        components={{
                          percent: <span />,
                          country: <span />,
                        }}
                      />
                    ),
                    description: (
                      <Trans
                        i18nKey="share.countrySmartIq"
                        values={{
                          iq,
                          percent: countryPercent,
                          country: t(`countries.${country}`),
                        }}
                        components={{
                          userIq: <span />,
                          percent: <span />,
                          country: <span />,
                        }}
                      />
                    ),
                  },
                  {
                    image: <img className="w-full" src={cake} alt="" />,
                    title: (
                      <Trans
                        i18nKey="share.ageSmartPercent"
                        values={{ percent: agePercent }}
                        components={{
                          percent: <span />,
                        }}
                      />
                    ),
                    description: (
                      <Trans
                        i18nKey="share.ageSmartIq"
                        values={{ percent: agePercent, iq }}
                        components={{
                          percent: <span />,
                          userIq: <span />,
                        }}
                      />
                    ),
                  },
                ]}
                onClose={() => setIsShareModalOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
