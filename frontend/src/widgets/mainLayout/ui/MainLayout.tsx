import { Outlet, NavLink } from "react-router";
import Book from "@/shared/assets/icons/book.svg?react";
import BookBlue from "@/shared/assets/icons/orange_book.svg?react";
import { useUserStore } from "@/entities/user";
import { useState } from "react";
import { useProfileStore } from "@/entities/user/model/fillProfileStore";
import Crown from "@/shared/assets/icons/p-crown.svg?react";
import Settings from "@/shared/assets/icons/settings.svg?react";
import BlueSettings from "@/shared/assets/icons/orange_settings.svg?react";

export const MainLayout = () => {
  const user = useUserStore((store) => store.user);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const isPremium = useProfileStore((store) => store.isPremium);
  return (
    <div className="">
      <Outlet />
      <nav className="border-outline-secondary bg-surface-primary fixed right-0 bottom-0 left-0 z-10 border-t-[1.5px] pt-[10px] pb-[34px]">
        <div className="flex justify-center gap-[48px]">
          <NavLink
            to="/main"
            className={({ isActive }: { isActive: boolean }) =>
              `flex h-[48px] w-[48px] items-center justify-center rounded-[50%] transition ${
                isActive ? "bg-dimmed-brand" : "bg-inherit"
              }`
            }
          >
            {({ isActive }: { isActive: boolean }) =>
              isActive ? <BookBlue /> : <Book className="text-text-primary" />
            }
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }: { isActive: boolean }) =>
              `relative flex h-[48px] w-[48px] items-center justify-center rounded-[50%] transition ${
                isActive ? "bg-dimmed-brand" : "bg-inherit"
              }`
            }
          >
            {!imageLoaded && (
              <div className="bg-outline-secondary absolute inset-0 animate-pulse rounded-full" />
            )}
            <img
              onLoad={() => setImageLoaded(true)}
              className={`h-[30px] w-[30px] rounded-full object-cover transition-opacity ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              src={user?.photoUrl}
              alt=""
            />
            {isPremium && (
              <div className="absolute top-[-10px] right-[-5px]">
                <Crown />
              </div>
            )}
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }: { isActive: boolean }) =>
              `relative flex h-[48px] w-[48px] items-center justify-center rounded-[50%] transition ${
                isActive ? "bg-dimmed-brand" : "bg-inherit"
              }`
            }
          >
            {({ isActive }: { isActive: boolean }) =>
              isActive ? (
                <BlueSettings className="w-[24px]" />
              ) : (
                <Settings className="text-text-primary w-[24px]" />
              )
            }
          </NavLink>
        </div>
      </nav>
    </div>
  );
};
