// 트위터/엑스 카드 미리보기 이미지 — 오픈그래프 이미지와 동일 렌더링 사용.
// Next.js가 직접 선언된 메타 export 만 인식하므로 여기서 다시 명시.
import OpengraphImage from "./opengraph-image";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "루트편입 — 편입수학·편입영어 CBT";

export default OpengraphImage;
