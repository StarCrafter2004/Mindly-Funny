import { useTestStore } from "@/entities/test/model/testStore";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Check from "@/shared/assets/icons/check.svg?react";
import { useNavigate, useParams } from "react-router";
import { PrimaryButton } from "@/shared/components";
import ChevronDown from "@/shared/assets/icons/chevron-down.svg?react";
import { ProgressBarWithTimer } from "./ProgressBarWithTimer";
import preparing from "@/shared/assets/img/preparing.png";
import {
  clearCustomBackHandler,
  setCustomBackHandler,
} from "@/shared/lib/back-handler";
import { ExitTestModal } from "@/widgets/modal";
import { api } from "@/shared/api/axiosInstance";
import { AnimatePresence, motion } from "framer-motion";
import { useProfileStore } from "@/entities/user/model/fillProfileStore";
import { popup } from "@telegram-apps/sdk";
import { useTranslation } from "react-i18next";
import { createTestResultByDocumentId } from "@/entities/test/api";
import { decrementLife } from "../api";

export const QuestionPage = () => {
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const { t } = useTranslation();
  // ─────────────── Refs ───────────────
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // ─────────────── Router ───────────────
  const navigate = useNavigate();
  const { id: documentId } = useParams();

  // ─────────────── Profile ───────────────
  const isProfileComplete = useProfileStore((s) => s.isProfileComplete);
  const setRedirectAfterFill = useProfileStore((s) => s.setRedirectToAfterFill);
  const isTestPassed = useProfileStore((store) => store.isTestPassed);
  console.log("isTestPassed", isTestPassed);

  // ─────────────── Test Store ───────────────
  const answerQuestion = useTestStore((s) => s.answerQuestion);
  const nextQuestion = useTestStore((s) => s.nextQuestion);

  const fetchTestByDocumentId = useTestStore((s) => s.fetchTestByDocumentId);
  const questions = useTestStore((s) => s.questions);
  const currentQuestionIndex = useTestStore((s) => s.currentQuestionIndex);
  const loading = useTestStore((s) => s.loading);
  const [resultsLoading, setResultsLoading] = useState<boolean>(false);
  const setDefault = useTestStore((s) => s.setDefault);
  const images = useTestStore((s) => s.Images);

  // ─────────────── State ───────────────
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [exitModalOpen, setExitModalOpen] = useState(false);
  const [scrollWidth, setScrollWidth] = useState<number>(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  // ─────────────── Derived data: question and answers ───────────────
  const question = questions[currentQuestionIndex];

  // ─────────────── Progress Bar & Timer ───────────────

  // ─────────────── Image logic ───────────────
  const currentImage = images.find(
    (img) => img.index === currentQuestionIndex + 1,
  )?.image;
  const baseUrl = api.defaults.baseURL;
  const currentImageUrl = currentImage?.url;
  const currentImageWidth = currentImage?.width;
  const currentImageHeight = currentImage?.height;

  const skeletonWidth = scrollWidth * 0.9;
  const skeletonHeight =
    (skeletonWidth * (currentImageHeight ?? 0)) / (currentImageWidth ?? 1);

  // ─────────────── Scroll check function ───────────────
  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollable = el.scrollHeight > el.clientHeight;
    const notAtBottom = el.scrollTop + el.clientHeight < el.scrollHeight - 1;
    setCanScrollDown(scrollable && notAtBottom);
  };

  // ─────────────── Scroll to bottom ───────────────
  const scrollToBottom = () =>
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });

  // ─────────────── Effects ───────────────
  useEffect(() => {
    if (documentId) fetchTestByDocumentId(documentId);
  }, [documentId, fetchTestByDocumentId]);

  useEffect(() => {
    setImageLoaded(false);
  }, [currentImageUrl]);

  useEffect(() => {
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
    return clearCustomBackHandler;
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll);
    return () => el.removeEventListener("scroll", checkScroll);
  }, [loading]);

  useEffect(() => {
    const timeout = setTimeout(checkScroll, 100);
    return () => clearTimeout(timeout);
  }, [question, currentImageUrl]);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const style = getComputedStyle(el);
    const contentWidth =
      el.clientWidth -
      parseFloat(style.paddingLeft) -
      parseFloat(style.paddingRight);
    setScrollWidth(contentWidth);
  }, []);

  // ─────────────── Handlers ───────────────
  const handleNext = async () => {
    if (selectedAnswer === null || !question) return;
    answerQuestion(selectedAnswer);
    if (currentQuestionIndex < questions.length - 1 && !isFinished) {
      nextQuestion();
    } else {
      setResultsLoading(true);

      if (!isTestPassed) {
        api.post("/api/referrals/increment");
      }
      console.log("finished");
      const answers = useTestStore.getState().answers;
      await createTestResultByDocumentId(documentId, answers);
      await decrementLife();
      setDefault();
      const path = `/result/${documentId}`;
      if (isProfileComplete) {
        navigate(path);
      } else {
        setRedirectAfterFill(path);
        navigate("/profile/fill");
      }
    }

    setSelectedAnswer(null);
  };

  // ─────────────── JSX ───────────────
  return (
    <>
      <div className="flex h-[100dvh] flex-col overflow-hidden">
        {/* Scrollable content */}
        <div
          ref={scrollRef}
          className="scrollbar-hide disable-scr overflow-y-auto px-[16px] pt-[16px] pb-[140px]"
        >
          {/* Progress bar + timer */}
          <ProgressBarWithTimer setIsFinished={setIsFinished} />

          {/* Image + Skeleton */}
          {currentImageUrl && (
            <div className="flex w-full justify-center">
              {!imageLoaded && (
                <div
                  className="bg-outline-secondary mb-4 animate-pulse rounded-lg"
                  style={{
                    width: `${skeletonWidth}px`,
                    height: `${skeletonHeight}px`,
                  }}
                />
              )}
              <img
                src={baseUrl + currentImageUrl}
                alt=""
                onLoad={() => setImageLoaded(true)}
                style={{ display: imageLoaded ? "block" : "none" }}
                className="mb-4 w-[90%] rounded-[16px]"
              />
            </div>
          )}

          {/* Question Text */}
          <div className="text-text-primary mb-3 text-[18px] font-semibold">
            {question?.text}
          </div>

          {/* Answers List */}
          <div className="flex flex-col gap-[8px]">
            {question?.answers.map((answer, i) => {
              const isSelected = selectedAnswer === i;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedAnswer(i)}
                  className={`bg-surface-primary text-text-primary flex w-full items-center rounded-[16px] border-[1.5px] px-[16px] py-[12px] text-[16px] font-medium ${
                    isSelected
                      ? "border-surface-brand"
                      : "border-outline-secondary"
                  }`}
                >
                  <div className="min-w-0 flex-1 text-left break-words">
                    {answer.text}
                  </div>
                  <div
                    className={`bg-surface-brand ml-[16px] flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                      isSelected ? "" : "opacity-0"
                    }`}
                  >
                    <Check className="text-outline-inversed" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scroll down button */}
        <AnimatePresence>
          {canScrollDown && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              onClick={scrollToBottom}
              className="bg-surface-secondary fixed right-[16px] bottom-[148px] z-10 flex h-[48px] w-[48px] items-center justify-center rounded-full px-4 py-2 text-sm text-white shadow-md"
            >
              <ChevronDown className="text-outline-primary w-full" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Next question button */}
        <div className="border-outline-secondary bg-surface-primary fixed bottom-0 left-0 w-full border-t-[1.5px] px-[16px] pt-[10px] pb-[48px]">
          <PrimaryButton
            onClick={handleNext}
            disabled={selectedAnswer === null}
            className="h-[60px] w-full rounded-[16px]"
          >
            {t("test.next")}
          </PrimaryButton>
        </div>
      </div>

      {/* Exit modal */}
      {exitModalOpen && (
        <ExitTestModal
          onExit={setDefault}
          onClose={() => setExitModalOpen(false)}
        />
      )}

      {resultsLoading && (
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
    </>
  );
};
