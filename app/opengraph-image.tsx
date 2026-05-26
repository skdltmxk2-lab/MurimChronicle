import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "루트편입 — 편입수학·편입영어 CBT";

const PRETENDARD_URL =
  "https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/public/static/Pretendard-Bold.otf";

export default async function OpengraphImage() {
  // Satori는 OTF/TTF/WOFF 지원. Pretendard OTF 를 요청 시 다운로드 (Next.js fetch 캐시 동작).
  let fontData: ArrayBuffer | null = null;
  try {
    const res = await fetch(PRETENDARD_URL, { cache: "force-cache" });
    if (res.ok) fontData = await res.arrayBuffer();
  } catch {
    fontData = null;
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "84px 96px",
          background:
            "linear-gradient(135deg, #1646ad 0%, #1857db 45%, #0b8a61 100%)",
          color: "white",
          position: "relative",
          fontFamily: fontData ? "Pretendard" : "system-ui",
        }}
      >
        {/* 데코 광택 오브 */}
        <div
          style={{
            position: "absolute",
            top: -120,
            left: -120,
            width: 360,
            height: 360,
            borderRadius: 999,
            background: "rgba(255,255,255,0.12)",
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -140,
            right: -100,
            width: 420,
            height: 420,
            borderRadius: 999,
            background: "rgba(187,238,214,0.22)",
            filter: "blur(80px)",
          }}
        />

        {/* 상단 라벨 */}
        <div
          style={{
            fontSize: 24,
            opacity: 0.78,
            letterSpacing: 10,
            marginBottom: 18,
            display: "flex",
          }}
        >
          ROUTE · 편입수학 · 편입영어
        </div>

        {/* 메인 타이틀 */}
        <div
          style={{
            fontSize: 104,
            lineHeight: 1.05,
            marginBottom: 22,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>편입 합격까지,</span>
          <span>가장 빠른 길.</span>
        </div>

        {/* 서브 카피 */}
        <div
          style={{
            fontSize: 30,
            opacity: 0.92,
            lineHeight: 1.45,
            marginBottom: 44,
            display: "flex",
          }}
        >
          1타강사 현장조교 풀이 · AI 검증 · 5,000+ 문항
        </div>

        {/* URL 칩 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 28,
              padding: "14px 32px",
              background: "white",
              color: "#1646ad",
              borderRadius: 999,
              display: "flex",
            }}
          >
            routrans.com
          </div>
          <div
            style={{
              fontSize: 24,
              padding: "14px 28px",
              border: "2px solid rgba(255,255,255,0.55)",
              borderRadius: 999,
              display: "flex",
              color: "rgba(255,255,255,0.95)",
            }}
          >
            무료로 시작하기 →
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [{ name: "Pretendard", data: fontData, weight: 700, style: "normal" }]
        : [],
    }
  );
}
