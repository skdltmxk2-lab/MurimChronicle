"use client";

// 루트 레이아웃(app/layout.tsx)까지 무너졌을 때 대신 렌더되는 화면.
// globals.css를 불러오던 레이아웃이 통째로 대체되므로 Tailwind 유틸리티가 없을 수 있다.
// 그래서 이 파일만은 클래스 대신 인라인 스타일 + 원시 hex 값으로 작성한다.
export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body
        style={{
          background: "#f5f7fb",
          color: "#172033",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', 'Malgun Gothic', sans-serif",
          margin: 0,
          minHeight: "100vh"
        }}
      >
        <main style={{ margin: "0 auto", maxWidth: "640px", padding: "64px 20px" }}>
          <section
            style={{
              background: "#ffffff",
              border: "1px solid #dfe5ef",
              borderRadius: "8px",
              boxShadow: "0 18px 50px rgba(23, 32, 51, 0.08)",
              padding: "32px",
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: "36px", marginBottom: "16px" }}>💥</div>
            <h1 style={{ fontSize: "20px", fontWeight: 900, margin: 0 }}>앱을 실행할 수 없습니다</h1>
            <p style={{ color: "#475569", fontSize: "14px", lineHeight: 1.6, margin: "8px 0 0" }}>
              화면 전체에서 오류가 발생했습니다. 다시 시도하거나 새로고침해 주세요.
            </p>
            {error.digest ? (
              <p style={{ color: "#64748b", fontSize: "12px", margin: "16px 0 0" }}>오류 코드: {error.digest}</p>
            ) : null}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                justifyContent: "center",
                marginTop: "24px"
              }}
            >
              <button
                type="button"
                onClick={() => reset()}
                style={{
                  background: "#1857db",
                  border: "none",
                  borderRadius: "6px",
                  color: "#ffffff",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 900,
                  padding: "12px 20px"
                }}
              >
                다시 시도
              </button>
              {/*
                global-error는 루트 레이아웃 자체가 깨졌을 때 뜨는 최후 화면이라,
                next/link의 클라이언트 전환이 아니라 전체 새로고침으로 빠져나가야 한다.
                (Link로 이동하면 망가진 트리를 그대로 들고 이동할 수 있다)
              */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a
                href="/"
                style={{
                  background: "#ffffff",
                  border: "1px solid #dfe5ef",
                  borderRadius: "6px",
                  color: "#334155",
                  fontSize: "14px",
                  fontWeight: 900,
                  padding: "12px 20px",
                  textDecoration: "none"
                }}
              >
                홈으로
              </a>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
