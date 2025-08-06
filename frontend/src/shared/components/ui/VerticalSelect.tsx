// components/VerticalSelect.tsx

import React from "react";
import Check from "@/shared/assets/icons/check.svg?react";

type SelectItem<T> = {
  id: T;
  icon?: React.ReactNode;
  label: React.ReactNode; // ✅ изменено с string на React.ReactNode
};

type VerticalSelectProps<T> = {
  options: SelectItem<T>[];
  value: T | null;
  onChange: (value: T) => void;
  className?: string;
};

export const VerticalSelect = <T extends string>({
  options,
  value,
  onChange,
  className,
}: VerticalSelectProps<T>) => {
  return (
    <div
      className={`text-text-primary flex w-full flex-col gap-[4px] text-[16px] font-medium ${className ?? ""}`}
    >
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          className={`bg-surface-primary flex w-full flex-row items-center justify-between rounded-[16px] border-[1.5px] px-[16px] py-[18px] leading-[24px] transition ${
            value === option.id
              ? "border-surface-brand"
              : "border-outline-secondary"
          } `}
        >
          <div className="text-text-primary flex flex-row items-center gap-[8px] text-[16px] leading-[24px] font-medium">
            {option.icon && (
              <div className="h-[24px] w-[24px]"> {option.icon}</div>
            )}
            {option.label}
          </div>
          {value === option.id ? (
            <div className="bg-surface-brand flex h-[24px] w-[24px] items-center justify-center rounded-[50%]">
              <Check className="text-outline-inversed" />
            </div>
          ) : null}
        </button>
      ))}
    </div>
  );
};
