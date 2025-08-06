import { type FC } from "react";

import greenCheck from "@/shared/assets/icons/green-check.png";
import redX from "@/shared/assets/icons/red-x.png";
import { useTranslation } from "react-i18next";

type AnswerCardProps = {
  question: string;
  userAnswer?: string;
  correctAnswer: string;
  isCorrect: boolean;
  className?: string;
  isResultPurchased: boolean;
};

export const AnswerCard: FC<AnswerCardProps> = ({
  question,
  userAnswer,
  correctAnswer,
  isCorrect,
  className,
  isResultPurchased,
}) => {
  const { t } = useTranslation();
  return (
    <div className={`border-outline-secondary w-full p-[16px] ${className}`}>
      <div className="mb-[8px] w-[32px]">
        {isCorrect ? (
          <img src={greenCheck} alt="" />
        ) : (
          <img src={redX} alt="" />
        )}
      </div>
      <div className="text-text-primary mb-[4px] text-[16px] font-semibold">
        {question}
      </div>
      <div
        className={`text-text-secondary mb-[4px] text-[16px] font-normal ${isResultPurchased ? "" : "blur-[6px] filter"}`}
      >
        {t("results.rightAnswer")} - {correctAnswer}
      </div>
      {userAnswer && (
        <div
          className={`text-text-secondary mb-[4px] text-[16px] font-normal ${isResultPurchased ? "" : "blur-[6px] filter"}`}
        >
          {t("results.yourAnswer")} - {userAnswer}
        </div>
      )}
    </div>
  );
};
