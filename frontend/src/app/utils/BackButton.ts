import { useEffect } from "react";
import { backButton } from "@telegram-apps/sdk-react";
import { useNavigate } from "react-router";
import { triggerCustomBack } from "@/shared/lib/back-handler";

export function BackButton() {
  const navigate = useNavigate();

  useEffect(() => {
    backButton.show();

    const handleClick = () => {
      const wasHandled = triggerCustomBack();

      if (!wasHandled) {
        navigate(-1); // fallback
      }
    };

    backButton.onClick(handleClick);

    return () => {
      backButton.hide();
      backButton.offClick(handleClick);
    };
  }, [navigate]);

  return null;
}
