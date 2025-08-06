import bg from "@/shared/assets/img/share-bg.png";
import crown from "@/shared/assets/img/crown.png";
import people from "@/shared/assets/img/man.png";
import star from "@/shared/assets/img/star.png";
import planet from "@/shared/assets/img/planet.png";
import cake from "@/shared/assets/img/cake.png";
import free from "@/shared/assets/img/free.png";

import reports from "@/shared/assets/img/reports.png";
import preparing from "@/shared/assets/img/preparing.png";
import Document from "@/shared/assets/icons/document.svg";
import greenCheck from "@/shared/assets/icons/green-check.png";
import redX from "@/shared/assets/icons/red-x.png";

export const ASSET_IMAGES = [
  bg,

  people,
  star,
  planet,
  cake,
  free,
  crown,
  reports,
  preparing,
  Document,
  greenCheck,
  redX,
] as const;

export type AssetImage = (typeof ASSET_IMAGES)[number];
