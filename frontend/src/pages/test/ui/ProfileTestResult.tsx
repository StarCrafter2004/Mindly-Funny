import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { ResultsChart } from "@/features/results";
import { ResultsList } from "@/widgets/results";
import { Statistics } from "@/widgets/statistics";
import { PrimaryButton, SecondaryButton } from "@/shared/components";
import preparing from "@/shared/assets/img/preparing.png";
import Document from "@/shared/assets/icons/document.svg?react";

import { getAnswerResultsByTestId } from "@/features/complitedTests/lib/getAnswerResultsByTestId";
import { getTestByDocumentIdWithoutImages } from "@/entities/test/api";
import {
  getCelebrityStats,
  getCountByAge,
  getCountByProfession,
  getCountByRegion,
  getFreeResult,
  getTestIQPercentile,
} from "../api";

import { useCompletedTestsStore } from "@/features/complitedTests/model/complitedTestStore";
import { useProfileStore } from "@/entities/user/model/fillProfileStore";
import type { AnswerResult } from "@/entities/test";
import { requestInvoice } from "@/features/payment";
import { AnimatePresence, motion } from "framer-motion";
import { PricingCard } from "@/widgets/pricingCard";
import { ShareModal } from "@/widgets/modal";

import crown from "@/shared/assets/img/crown.png";
import people from "@/shared/assets/img/man.png";
import star from "@/shared/assets/img/star.png";
import planet from "@/shared/assets/img/planet.png";
import cake from "@/shared/assets/img/cake.png";
import { useTonPay } from "@/features/payment/model/requestInvoice";

export const ProfileTestResult = () => {
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  const [isPurchasedModalOpen, setIsPurchaseModalOpen] =
    useState<boolean>(false);
  const { pay } = useTonPay();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: documentId } = useParams();
  const [isResultPurchased, setIsResultPurchased] = useState<boolean>(false);
  const [resultsStars, setResultsStars] = useState<number | null>(null);
  const [resultsTon, setResultsTon] = useState<number | null>(null);

  const getTestById = useCompletedTestsStore((state) => state.getTestById);
  const profession = useProfileStore((state) => state.profession);
  const country = useProfileStore((state) => state.country);
  const age = useProfileStore((state) => state.age);
  const [celebrity, setCelebrity] = useState<{ iq: number; name: string }>({
    iq: 0,
    name: "",
  });
  const [results, setResults] = useState<AnswerResult[]>([]);
  const [iq, setIq] = useState(0);
  const [worldPercent, setWorldPercent] = useState<number | null>(null);
  const [professionPercent, setProfessionPercent] = useState<number | null>(
    null,
  );
  const [countryPercent, setCountryPercent] = useState<number | null>(null);
  const [agePercent, setAgePercent] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);
  const freeReports = useProfileStore((store) => store.freeReports);
  const fetchProfile = useProfileStore((store) => store.fetchProfile);

  if (error) {
    navigate("/main");
    toast("error");
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (!documentId) {
        setLoading(false);
        setError(true);
        return;
      }
      try {
        const testResult = getTestById(documentId);
        if (!testResult) throw new Error("Test not found");

        const { data: test } =
          await getTestByDocumentIdWithoutImages(documentId);
        const answerResults = getAnswerResultsByTestId(
          testResult,
          test,
          t("results.timeLeft"),
        );

        setResults(answerResults);
        setResultsStars(test.resultsStars);
        console.log("setResultsTon", test);
        setResultsTon(test.resultsTon);
        setIsResultPurchased(test.isResultPurchased);
        const correctAnswers = answerResults.filter((a) => a.isCorrect).length;
        const calculatedIq =
          70 + Math.round(0.8 * 100 * (correctAnswers / answerResults.length));
        setIq(calculatedIq);

        if (profession && country && age) {
          const [celeb, world, prof, region, ageStat] = await Promise.all([
            getCelebrityStats(calculatedIq),
            getTestIQPercentile(documentId, calculatedIq),
            getCountByProfession(documentId, calculatedIq, profession),
            getCountByRegion(documentId, calculatedIq, country),
            getCountByAge(documentId, calculatedIq, age),
          ]);
          setCelebrity(celeb);
          setWorldPercent(world);
          setProfessionPercent(prof);
          setCountryPercent(region);
          setAgePercent(ageStat);
        }
      } catch (err) {
        setLoading(false);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [documentId, navigate, profession, country, age, getTestById, t]);

  return (
    <div className="px-[16px] pt-[16px] pb-[48px]">
      <h1 className="text-text-primary mb-[12px] text-[24px] font-semibold">
        {t("results.title")}
      </h1>

      <ResultsChart iq={iq} percent={worldPercent} />

      <h2 className="mb-[12px] text-[24px] font-semibold">
        {t("results.statistics")}
      </h2>
      {!isResultPurchased && (
        <PrimaryButton
          onClick={async () => {
            if (freeReports > 0) {
              try {
                const res = await getFreeResult(documentId);
                if (res) {
                  setLoading(true);
                  await fetchProfile();
                  setIsResultPurchased(true);
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

      <h2 className="text-text-primary mb-[12px] text-[24px] font-semibold">
        {t("results.answers.title")}
      </h2>

      <ResultsList
        isResultPurchased={isResultPurchased}
        className="mb-[32px]"
        results={results}
      />

      <PrimaryButton
        onClick={() => setIsShareModalOpen(true)}
        className="mb-[12px] w-full rounded-[16px] p-[18px]"
      >
        {t("results.share")}
      </PrimaryButton>

      <SecondaryButton
        onClick={() => {
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
        {isPurchasedModalOpen && (
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
                    setLoading(true);
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
                    setLoading(false);
                  }
                }}
                onTon={async () => {
                  if (resultsTon && documentId) {
                    const res = await pay({
                      amount: resultsTon,
                      type: "result",
                      testId: documentId,
                    });
                    setLoading(true);
                    console.log("tonStatus", res);
                    if (res.status === "paid") {
                      setIsResultPurchased(true);
                      setIsPurchaseModalOpen(false);
                    }
                    setLoading(false);
                  }
                }}
                stars={resultsStars}
                ton={resultsTon}
                onClose={() => {
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
