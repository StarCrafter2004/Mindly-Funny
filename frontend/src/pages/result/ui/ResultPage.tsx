import { PrimaryButton, SecondaryButton } from "@/shared/components";
import { ShareModal } from "@/widgets/modal";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { useResultStore } from "../model/resultStore";
import { useTranslation } from "react-i18next";
import preparing from "@/shared/assets/img/preparing.png";
import { popup } from "@telegram-apps/sdk";
import {
  clearCustomBackHandler,
  setCustomBackHandler,
} from "@/shared/lib/back-handler";

import { AnswerCard, StatusCard, ThresholdAnswerCard } from "@/widgets/results";
import { api } from "@/shared/api/axiosInstance";

const baseUrl = api.defaults.baseURL;

export const ResultPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const { id: documentId } = useParams<{ id: string }>();
  const location = useLocation();

  const isFromProfile = location.pathname.startsWith("/profile");

  const {
    isFetched,
    fetchResult,
    setDefault,
    description,
    questionAnswers,
    status,
    type,
    image,
    testName,
    isLoading: loading,
  } = useResultStore();

  console.log("image", image);

  useEffect(() => {
    if (!isFetched) {
      fetchResult(documentId ?? "");
    }
  }, []);

  useEffect(() => {
    setCustomBackHandler(async () => {
      if (isFromProfile) {
        navigate("/profile");
        return;
      }
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
        setDefault();
        navigate("/main");
      }
    });
    return clearCustomBackHandler;
  }, []);

  return (
    <div className="px-[16px] pt-[16px] pb-[48px]">
      <div className="text-text-primary mb-[12px] text-[24px] font-semibold">
        {t("results.title")}
      </div>
      <StatusCard
        {...(image?.url
          ? { image: <img src={baseUrl + image.url} className="w-full" /> }
          : testName
            ? { testName }
            : {})}
        status={status}
        description={description}
      />

      <PrimaryButton
        onClick={() => setIsShareModalOpen(true)}
        className="mb-[12px] w-full rounded-[16px] p-[18px]"
      >
        {t("results.share")}
      </PrimaryButton>
      <div className="text-text-primary text- mb-[12px] text-[24px] font-semibold">
        {t("results.answers.title")}
      </div>
      {type === "status-with-threshold" ? (
        <div className="mb-[12px] flex flex-col gap-[4px]">
          {questionAnswers.slice(0, 3).map((item) => (
            <ThresholdAnswerCard
              question={item.question}
              userAnswer={item.answer.text}
              correctAnswer={item.correctAnswer.text}
              isCorrect={item.isCorrect ?? false}
            />
          ))}
        </div>
      ) : (
        <div className="mb-[12px] flex flex-col gap-[4px]">
          {questionAnswers.slice(0, 3).map((item) => (
            <AnswerCard
              question={item.question}
              userAnswer={item.answer.text}
            />
          ))}{" "}
        </div>
      )}

      {questionAnswers.length > 3 && (
        <Link to="/all-answers">
          <SecondaryButton className="mb-[24px] w-full rounded-[16px] p-[18px]">
            {t("results.answers.viewAll")}
          </SecondaryButton>
        </Link>
      )}

      <SecondaryButton
        onClick={() => {
          setDefault();
          navigate("/main");
        }}
        className="text-text-primary w-full rounded-[16px] p-[18px] text-[16px] font-medium"
      >
        {t("results.homeScreen")}
      </SecondaryButton>

      <AnimatePresence>
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
                children={
                  <StatusCard
                    {...(image?.url
                      ? {
                          image: (
                            <img src={baseUrl + image.url} className="w-full" />
                          ),
                        }
                      : {})}
                    {...(testName ? { testName } : {})}
                    status={status}
                    description={description}
                  />
                }
                onClose={() => setIsShareModalOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
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
    </div>
  );
};
