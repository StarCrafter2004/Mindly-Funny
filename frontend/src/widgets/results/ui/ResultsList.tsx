import { type FC } from "react";
import type { AnswerResult } from "@/entities/test";
import { AnswerCard } from "./AnswerCard";

type ResultsListProps = {
  results: AnswerResult[];
  className?: string;
  isResultPurchased: boolean;
};

export const ResultsList: FC<ResultsListProps> = ({
  results,
  className,
  isResultPurchased,
}) => {
  return (
    <div
      className={`border-outline-secondary flex flex-col rounded-[16px] border-[1.5px] ${className}`}
    >
      {results.map((result, i) => (
        <AnswerCard
          {...result}
          className={`${i === 0 ? "" : "border-t-[1.5px]"} `}
          isResultPurchased={isResultPurchased}
        />
      ))}
    </div>
  );
};
