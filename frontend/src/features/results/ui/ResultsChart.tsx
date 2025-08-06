import Cloud from "@/shared/assets/icons/cloud.svg?react";
import { Trans, useTranslation } from "react-i18next";

const data = [
  { value: 1, color: "#64BDC6", percentile: 2 }, // 0–54
  { value: 2, color: "#64BDC6", percentile: 9 }, // 55–64
  { value: 4, color: "#EECA34", percentile: 16 }, // 65–69
  { value: 10, color: "#FE6A35", percentile: 25 }, // 70–74
  { value: 21, color: "#FA4B42", percentile: 37 }, // 75–79
  { value: 38, color: "#EE60E0", percentile: 50 }, // 80–84
  { value: 61, color: "#7B47E9", percentile: 63 }, // 85–89
  { value: 81, color: "#5D89DF", percentile: 75 }, // 90–94
  { value: 112, color: "#6AD1FE", percentile: 84 }, // 95–99
  { value: 153, color: "#3FDC7E", percentile: 91 }, // 100–104
  { value: 131, color: "#2B72FB", percentile: 95 }, // 105–109
  { value: 103, color: "#64BDC6", percentile: 98 }, // 110–114
  { value: 81, color: "#EECA34", percentile: 99 }, // 115–119
  { value: 58, color: "#FE6A35", percentile: 99 }, // 120–124 (~99.5)
  { value: 41, color: "#FA4B42", percentile: 99 }, // 125–129 (>99)
  { value: 28, color: "#EE60E0", percentile: 99 }, // 130–134 (≈99.9)
  { value: 15, color: "#7B47E9", percentile: 99.9 }, // 135–139
  { value: 7, color: "#5D89DF", percentile: 99.9 }, // 140–144
  { value: 4, color: "#6AD1FE", percentile: 99.9 }, // 145–149
  { value: 2, color: "#6AD1FE", percentile: 99.99 }, // 150–159
  { value: 1, color: "#6AD1FE", percentile: 99.99 }, // 160+
];

type ResultsChartProps = {
  iq: number;
  percent?: number | null;
};

function getIQIndex(iq: number): number {
  if (iq <= 54) return 0;
  if (iq <= 64) return 1;
  if (iq <= 69) return 2;
  if (iq <= 74) return 3;
  if (iq <= 79) return 4;
  if (iq <= 84) return 5;
  if (iq <= 89) return 6;
  if (iq <= 94) return 7;
  if (iq <= 99) return 8;
  if (iq <= 104) return 9;
  if (iq <= 109) return 10;
  if (iq <= 114) return 11;
  if (iq <= 119) return 12;
  if (iq <= 124) return 13;
  if (iq <= 129) return 14;
  if (iq <= 134) return 15;
  if (iq <= 139) return 16;
  if (iq <= 144) return 17;
  if (iq <= 149) return 18;
  if (iq <= 159) return 19;
  return 20;
}

export const ResultsChart = ({ iq, percent }: ResultsChartProps) => {
  const { t } = useTranslation();
  const idx = getIQIndex(iq);

  return (
    <div className="border-outline-secondary mb-[24px] rounded-[16px] border-[1.5px]">
      <div className="border-outline-secondary flex h-[190px] items-end justify-around gap-[7px] border-b-[1.5px] px-[16px] pt-[16px]">
        {data.map((item, index) => (
          <div
            key={index}
            style={{ height: `${item.value}px`, backgroundColor: item.color }}
            className="border-outline-secondary relative flex-1 rounded-t-[8px] border-[1.5px]"
          >
            {index === idx && (
              <div className="absolute top-[-40px] left-[50%] z-50 translate-x-[-50%] p-[9px]">
                <Cloud className="absolute left-[50%] -z-10 w-full translate-x-[-50%]" />
                <div className="text-text-inversed">You</div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-[4px] px-[16px] pt-[11px] pb-[16px] leading-[26px]">
        <div className="text-text-primary text-[18px] leading-[32px] font-semibold">
          {t("results.iqScore")}
        </div>
        <div className="text-text-primary text-[24px] font-semibold">
          {" "}
          {iq}{" "}
        </div>
        <div className="text-text-secondary text-[16px] font-normal">
          <Trans
            i18nKey="results.worldComparison"
            values={{ percent }}
            components={{
              percent: (
                <span className="text-text-primary text-[16px] font-semibold" />
              ),
            }}
          />
        </div>
      </div>
    </div>
  );
};
