import { useState, useRef, useEffect, type FC } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Chevronup from "@/shared/assets/icons/chevron-up.svg?react";

type DropdownOption = {
  id: string;
  label: string;
};

type DropdownProps = {
  trigger: string;
  options: DropdownOption[];
  value: string | null;
  onSelect: (id: string) => void;
  className?: string;
};

export const Dropdown: FC<DropdownProps> = ({
  trigger,
  options,
  value,
  onSelect,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleClickOutside);
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={ref} className={`relative w-full transition-all ${className}`}>
      <div
        className="text-text-primary bg-surface-primary border-outline-secondary h-full w-full rounded-[16px] border-[1.5px] p-[16px] text-[16px] font-normal select-none"
        onClick={() => setOpen((prev) => !prev)}
      >
        <div className="flex items-center justify-between">
          {value ?? trigger}
          <Chevronup
            className={`stroke-text-primary transition-transform duration-300 ${open ? "" : "rotate-x-180"}`}
          />
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 12 }}
            exit={{ opacity: 0, y: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="bg-surface-primary text-text-primary border-outline-secondary absolute z-10 w-full rounded-[16px] border-[1.5px] p-[16px] text-[16px] font-medium"
          >
            {options.map((option) => (
              <div
                key={option.id}
                className="cursor-pointer px-[16px] py-[12px]"
                onClick={() => {
                  onSelect(option.id);
                  setOpen(false);
                }}
              >
                {option.label}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
