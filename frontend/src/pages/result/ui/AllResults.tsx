import { useResultStore } from "../model/resultStore";
import greenCheck from "@/shared/assets/icons/green-check.png";
import redX from "@/shared/assets/icons/red-x.png";
import { AnswerCard } from "@/widgets/results";
import { useTranslation } from "react-i18next";

export const AllResults = () => {
  const questionAnswers = useResultStore((store) => store.questionAnswers);
  const type = useResultStore((store) => store.type);
  const { t } = useTranslation();
  return (
    <div className="px-[16px] pt-[16px] pb-[48px]">
      <div className="text-text-primary text- mb-[12px] text-[24px] font-semibold">
        {t("results.answers.title")}
      </div>
      {type === "status-with-threshold" ? (
        <div className="mb-[12px] flex flex-col gap-[4px]">
          {questionAnswers.map((item) => (
            <div className="border-outline-secondary rounded-[16px] border-[1.5px] p-[16px]">
              <div className="mb-[8px] w-[32px]">
                {item.isCorrect ? (
                  <img src={greenCheck} alt="" />
                ) : (
                  <img src={redX} alt="" />
                )}
              </div>
              <div className="text-text-primary mb-[4px] text-[16px] font-semibold">
                {item.question}
              </div>
              <div
                className={`text-text-secondary mb-[4px] text-[16px] font-normal`}
              >
                {t("results.rightAnswer")} - {item.correctAnswer.text}
              </div>
              {item.answer && (
                <div
                  className={`text-text-secondary mb-[4px] text-[16px] font-normal`}
                >
                  {t("results.yourAnswer")} - {item.answer.text}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-[12px] flex flex-col gap-[4px]">
          {questionAnswers.map((item) => (
            <AnswerCard
              question={item.question}
              userAnswer={item.answer.text}
            />
          ))}{" "}
        </div>
      )}
    </div>
  );
};
