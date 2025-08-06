import { Outlet } from "react-router";

export const TestLayout = () => {
  return (
    <div className="relative h-[100dvh]">
      <div className="flex h-full flex-col px-[16px] pt-[16px]">
        <div className="z-50 min-h-[64px] w-full bg-black"></div>
        <Outlet />
      </div>
    </div>
  );
};
