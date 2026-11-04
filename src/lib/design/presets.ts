export const SITE_DESIGN_IDS = ["coral", "terrazzo", "console"] as const;

export type SiteDesign = (typeof SITE_DESIGN_IDS)[number];

export const DEFAULT_SITE_DESIGN: SiteDesign = "coral";

export const SITE_DESIGNS: ReadonlyArray<{
  id: SiteDesign;
  name: string;
  description: string;
  recommended: boolean;
}> = [
  {
    id: "coral",
    name: "Coral",
    description: "따뜻한 회색과 코랄 포인트, 부드러운 학습 공간",
    recommended: true,
  },
  {
    id: "terrazzo",
    name: "Terrazzo",
    description: "종이 같은 바탕과 각진 테두리, 선명한 문제지",
    recommended: false,
  },
  {
    id: "console",
    name: "Console",
    description: "차분한 기술적 색감과 또렷한 정보 구조",
    recommended: false,
  },
];

export function isSiteDesign(value: unknown): value is SiteDesign {
  return typeof value === "string" && SITE_DESIGN_IDS.some((id) => id === value);
}
