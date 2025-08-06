import type { FC } from "react";
import type { FilterOption } from "../model/types";

type FilterSliderProps = {
  filter: string;
  onFilterChange: (filter: string) => void;
  className?: string;
  options: Array<FilterOption | null>;
};

export const FilterSlider: FC<FilterSliderProps> = ({
  filter,
  onFilterChange,
  options,
  className,
}) => {
  return (
    <div
      className={`scrollbar-hide mb-[12px] flex gap-[4px] overflow-y-auto px-[16px] ${className}`}
    >
      {options.map((option) => {
        if (option == null) {
          return null;
        }
        return (
          <button
            key={option?.id}
            onClick={() => onFilterChange(option.id)}
            className={`rounded-[16px] px-[16px] py-[12px] text-[16px] font-medium transition-all duration-200 ${option.id === filter ? "bg-surface-inversed text-text-inversed border-[1.5px]" : "bg-surface-primary text-text-primary border-outline-secondary border-[1.5px]"}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
