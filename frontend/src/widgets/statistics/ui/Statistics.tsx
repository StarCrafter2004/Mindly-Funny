import star from "@/shared/assets/img/star.png";
import man from "@/shared/assets/img/man.png";
import planet from "@/shared/assets/img/planet.png";
import cake from "@/shared/assets/img/cake.png";
import { Trans, useTranslation } from "react-i18next";
import { useProfileStore } from "@/entities/user/model/fillProfileStore";

type StatisticsProps = {
  celebrity: string;
  celebrityIQ: number;
  professionPercent: number;
  countryPercent: number;
  agePercent: number;
  isResultPurchased: boolean;
};

export const Statistics = ({
  celebrity,
  celebrityIQ,
  professionPercent,
  countryPercent,
  agePercent,
  isResultPurchased,
}: StatisticsProps) => {
  const { t } = useTranslation();
  const profession = useProfileStore((store) => store.profession);
  const country = useProfileStore((store) => store.country);

  return (
    <div className="border-outline-secondary mb-[24px] overflow-hidden rounded-[16px] border-[1.5px]">
      <div className="border-outline-secondary border-b-[1.5px] p-[16px]">
        <img className="mb-[8px] w-[32px]" src={star} alt="" />
        <div className="text-text-primary relative mb-[4px] text-[18px] font-semibold">
          <Trans
            i18nKey="results.celebrityComparisonTitle"
            values={{ celebrity }}
            components={{
              celebrity: <span className="text-text-primary font-semibold" />,
            }}
          />
        </div>
        <div
          className={`text-text-secondary relative text-[16px] font-normal ${isResultPurchased ? "" : "blur-[6px]"} `}
        >
          <Trans
            i18nKey="results.celebrityComparisonText"
            values={{ celebrity, celebrityIQ }}
            components={{
              celebrity: <span className="text-text-primary font-medium" />,
              celebrityIQ: <span className="text-text-primary font-medium" />,
            }}
          />
        </div>
      </div>
      <div className="border-outline-secondary border-b-[1.5px] p-[16px]">
        <img className="mb-[8px] w-[32px]" src={man} alt="" />
        <div className="text-text-primary mb-[4px] text-[18px] font-semibold">
          {t("results.profession")}
        </div>
        <div
          className={`text-text-secondary relative text-[16px] font-normal ${isResultPurchased ? "" : "blur-[6px]"} `}
        >
          <Trans
            i18nKey="results.professionText"
            values={{
              percent: professionPercent,
              profession: t(`professions.${profession}`),
            }}
            components={{
              percent: <span className="text-text-primary font-medium" />,
              profession: <span className="text-text-primary font-medium" />,
            }}
          />
        </div>
      </div>
      <div className="border-outline-secondary border-b-[1.5px] p-[16px]">
        <img className="mb-[8px] w-[32px]" src={planet} alt="" />
        <div className="text-text-primary mb-[4px] text-[18px] font-semibold">
          {t("results.country")}
        </div>
        <div
          className={`text-text-secondary relative text-[16px] font-normal ${isResultPurchased ? "" : "blur-[6px]"} `}
        >
          <Trans
            i18nKey="results.countryText"
            values={{
              percent: countryPercent,
              country: t(`countries.${country}`),
            }}
            components={{
              percent: <span className="text-text-primary font-medium" />,
              country: <span className="text-text-primary font-medium" />,
            }}
          />
        </div>
      </div>
      <div className="p-[16px]">
        <img className="mb-[8px] w-[32px]" src={cake} alt="" />
        <div className="text-text-primary mb-[4px] text-[18px] font-semibold">
          {t("results.age")}
        </div>
        <div
          className={`text-text-secondary relative text-[16px] font-normal ${isResultPurchased ? "" : "blur-[6px]"} `}
        >
          <Trans
            i18nKey="results.ageText"
            values={{ percent: agePercent }}
            components={{
              percent: <span className="text-text-primary font-medium" />,
            }}
          />
        </div>
      </div>
    </div>
  );
};
