import bg from "@/shared/assets/img/share-bg.png";
import X from "@/shared/assets/icons/close.svg?react";
import { useRef, useState, type FC, type ReactNode } from "react";

import { PrimaryButton } from "@/shared/components";
import { useTranslation } from "react-i18next";
import { toJpeg } from "html-to-image";
import { api } from "@/shared/api/axiosInstance";
import { useAppStore } from "@/shared/lib/appStore";
import { shareStory } from "@telegram-apps/sdk";
import type { Media } from "@/entities/test/model/types";

type ShareModalProps = {
  onClose: () => void;
  children: ReactNode;
};

export const ShareModal: FC<ShareModalProps> = ({ children, onClose }) => {
  const imageRef = useRef<HTMLDivElement>(null);
  const shareImageReady = useAppStore((store) => store.shareImageReady);
  const setShareImageReady = useAppStore((store) => store.setShareImageReady);
  const baseUrl = api.defaults.baseURL;
  const [loading, setLoading] = useState<boolean>(false);

  const uploadToStrapi = async () => {
    if (!imageRef.current) return;
    setLoading(true);
    try {
      if (!shareImageReady) {
        console.log("preload");
        await toJpeg(imageRef.current, {
          quality: 0.05,
          cacheBust: false,
        });
        setShareImageReady();
      }

      const dataUrl = await toJpeg(imageRef.current, {
        quality: 0.95,
        cacheBust: false,
      });
      console.log("Generated dataUrl:", dataUrl?.slice(0, 50), "...");

      const res = await fetch(dataUrl);
      console.log("fetch status:", res.status);
      const blob = await res.blob();
      console.log("Blob size/type:", blob.size, blob.type);

      const formData = new FormData();
      formData.append("files", blob, "red-square.jpg");

      const uploadRes = await api.post<Media[]>("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log();
      setLoading(false);
      console.log("shareStory.isAvailable()", shareStory.isAvailable());

      console.log("Strapi upload result:", uploadRes.data);

      if (shareStory.isAvailable()) {
        console.log(uploadRes.data[0].url);
        shareStory(baseUrl + uploadRes.data[0].url, {
          widgetLink: {
            url: "https://t.me/test_lub_bot",
            name: "@test_lub_bot",
          },
        });
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setLoading(false);
    }
  };

  const { t } = useTranslation();
  return (
    <div
      className={`bg-surface-primary relative z-10 h-[100vh] overflow-hidden rounded-t-[24px] pt-[16px] pb-[48px]`}
    >
      {loading && <div className="absolute inset-0 z-15 bg-black/20"></div>}
      <button
        onClick={onClose}
        className="bg-surface-secondary absolute right-[16px] z-5 flex h-[48px] w-[48px] items-center justify-center rounded-[12px]"
      >
        <X className="text-outline-primary h-[24px] w-[24px]" />
      </button>

      <div
        ref={imageRef}
        className="flex h-full w-full max-w-[500px] items-center justify-center"
      >
        <div className="bg-surface-primary pointer-events-none absolute inset-0 -z-3"></div>
        <img className="absolute -z-1 w-full" src={bg} alt="" />
        <div className="bg-surface-inversed/10 pointer-events-none absolute inset-0 -z-2"></div>
        {children}
      </div>
      <div className="absolute bottom-[10px] flex w-full flex-col items-center p-[16px]">
        {" "}
        <PrimaryButton
          onClick={() => uploadToStrapi()}
          className="mb-[12px] w-full rounded-[16px] p-[18px]"
        >
          {t("results.share")}
        </PrimaryButton>
      </div>
    </div>
  );
};
