import { useRef, type FC } from "react";
import Magnifer from "@/shared/assets/icons/magnifer.svg?react";
import Xcircle from "@/shared/assets/icons/x-circle.svg?react";

type InputProps = {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  isMagnifer?: boolean;
  className?: string;
};

export const Input: FC<InputProps> = ({
  value,
  onChange,
  onClear,
  placeholder,
  isMagnifer = false,
  className,
}) => {
  // const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
  //   setIsFocused(true);
  //   onFocus?.(e);
  // };

  // const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
  //   setIsFocused(false);
  //   onBlur?.(e);
  // };

  const handleClear = () => {
    onClear?.();
    onChange("");
  };

  return (
    <div className="group relative z-0 overflow-hidden rounded-[16px]">
      <div
        className={`bg-surface-secondary border-outline-secondary focus-within:bg-surface-primary flex h-[56px] items-center gap-[8px] overflow-hidden rounded-[16px] border-[1.5px] px-[16px] ${className}`}
      >
        {isMagnifer && (
          <div
            onClick={() => inputRef.current?.focus()}
            className="cursor-pointer"
          >
            <Magnifer className="text-dimmed-primary z-10" />
          </div>
        )}

        <input
          ref={inputRef}
          className="placeholder:text-text-secondary text-text-secondary z-10 h-full w-full flex-grow gap-[8px] text-[16px] font-normal outline-none placeholder:text-[16px] placeholder:font-normal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        {value !== "" && (
          <div
            onClick={handleClear}
            className="bg-surface-secondary z-10 flex h-[19.5px] w-[19.5px] cursor-pointer items-center justify-center rounded-[50%]"
          >
            <Xcircle className="text-surface-inversed" />{" "}
          </div>
        )}
      </div>
      <span className="bg-surface-inversed pointer-events-none absolute inset-0 z-0 h-full w-full opacity-0 transition-opacity group-hover:opacity-2" />
    </div>
  );
};
