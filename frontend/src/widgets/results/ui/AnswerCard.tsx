import { type FC } from "react";

type AnswerCardProps = {
  question: string;
  userAnswer?: string;
};

export const AnswerCard: FC<AnswerCardProps> = ({ question, userAnswer }) => {
  return (
    <div
      className={`border-outline-secondary w-full rounded-[16px] border-[1.5px] p-[16px]`}
    >
      <div className="text-text-primary mb-[4px] text-[18px] font-semibold">
        {question}
      </div>

      <div className={`text-text-secondary mb-[4px] text-[16px] font-normal`}>
        {userAnswer}
      </div>
    </div>
  );
};
