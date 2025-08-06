type SelectItem<T extends string> = {
  id: T;
  label: string;
};

type SelectProps<T extends string> = {
  options: SelectItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

export const Select = <T extends string>({
  options,
  value,
  onChange,
  className,
}: SelectProps<T>) => {
  return (
    <div
      className={`border-secondary border-outline-secondary flex h-[56px] overflow-hidden rounded-[16px] border-[1.5px] text-[16px] font-medium ${className ?? ""}`}
    >
      {options.map((option, i) => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          className={`border-outline-secondary flex-1 transition ${
            value === option.id
              ? "bg-surface-secondary text-text-primary"
              : "text-text-secondary"
          } ${i === 0 ? "" : "border-l-[1.5px]"}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
