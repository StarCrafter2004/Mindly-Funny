import bg from "@/shared/assets/img/share-bg.png";
import crown from "@/shared/assets/img/crown.webp";
import people from "@/shared/assets/img/man.webp";
import star from "@/shared/assets/img/star.webp";
import planet from "@/shared/assets/img/planet.webp";
import cake from "@/shared/assets/img/cake.webp";
import free from "@/shared/assets/img/free.webp";

import reports from "@/shared/assets/img/reports.webp";
import preparing from "@/shared/assets/img/preparing.webp";
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
