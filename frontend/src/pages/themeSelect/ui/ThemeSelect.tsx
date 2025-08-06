import { ThemeSwitcher } from "@/features/theme";

export const ThemeSelect = () => {
  return (
    <div className="bg-surface-primary h-[100dvh] w-full overflow-y-auto">
      <div className="w-full p-[16px]">
        <div className="text-text-primary mb-[4px] text-[24px] font-semibold">
          Choose Theme
        </div>
        <div className="text-text-secondary mb-[16px] text-[16px] font-normal">
          Select your preferred theme
        </div>
        <ThemeSwitcher />
      </div>
    </div>
  );
};
