import { useTestStore } from "@/entities/test/model/testStore";
import { useCallback, useEffect } from "react";

export const ProgressBarWithTimer = () => {
  const currentIndex = useTestStore((state) => state.currentQuestionIndex);
  const totalQuestions = useTestStore((state) => state.questions.length);
  const answeredPercent = ((currentIndex + 1) / totalQuestions) * 100;
  const tick = useTestStore((s) => s.tickTime);

  const tickTime = useCallback(() => {
    tick();
  }, []);
  const timeLeft = useTestStore((s) => s.timeLimit);
  const maxTime = useTestStore((s) => s.initialTimeLimit);
  const minutes = Math.floor((timeLeft ?? 0) / 60);
  const seconds = (timeLeft ?? 0) % 60;
  const autoFillRemainingAnswers = useTestStore(
    (s) => s.autoFillRemainingAnswers,
  );

  const finishTest = useTestStore((s) => s.finishTest);
  useEffect(() => {
    const interval = setInterval(() => tickTime(), 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (timeLeft !== null) {
      if (timeLeft <= 0) {
        autoFillRemainingAnswers();
        finishTest();
      }
    }
  }, [timeLeft]);

  if (timeLeft === null || maxTime === null) return null;

  return (
    <div className="mb-4 flex flex-row items-center justify-between gap-[8px]">
      <div className="bg-surface-secondary h-[12px] flex-1 overflow-hidden rounded-[50px]">
        <div
          className="bg-surface-inversed h-full transition-all"
          style={{
            width: `${answeredPercent}%`,
          }}
        />
      </div>
      <div className="text-text-primary flex min-w-[45px] justify-between text-[16px] font-medium">
        <div>
          {" "}
          {minutes}:{String(seconds).padStart(2, "0")}
        </div>
      </div>
    </div>
  );
};
