"use client";

import { useAuth } from "@/lib/auth/AuthContext";

const KAKAO_OPEN_CHAT_URL = "https://open.kakao.com/o/sBAS3Yti";

const PRO_PRICE = 29900;

type TierId = "free" | "pro";

type Tier = {
  id: TierId;
  label: string;
  price: number; // 월 결제 가격(원). 0이면 무료
  tagline: string;
  badge?: string;
  headerBg: string;
  rim: string;
  priceText: string;
  emoji: string;
};

const TIERS: Tier[] = [
  {
    id: "free",
    label: "Free",
    price: 0,
    tagline: "핵심 학습 기능을 무료로",
    headerBg: "bg-slate-100",
    rim: "border-slate-300",
    priceText: "text-slate-700",
    emoji: "🌱",
  },
  {
    id: "pro",
    label: "Pro",
    price: PRO_PRICE,
    tagline: "광고 없이, 모든 기능을 한 번에",
    badge: "추천",
    headerBg: "bg-amber-50",
    rim: "border-amber-400",
    priceText: "text-amber-700",
    emoji: "🏆",
  },
];

type FeatureRow = {
  label: string;
  desc?: string;
  values: Record<TierId, boolean | string>;
};

const FEATURES: FeatureRow[] = [
  { label: "커뮤니티", values: { free: true, pro: true } },
  { label: "데일리 테스트 (5문항/일)", values: { free: true, pro: true } },
  { label: "단원별 학습 (무제한)", values: { free: true, pro: true } },
  { label: "과목별 모의고사", values: { free: true, pro: true } },
  { label: "취약유형 모의고사 (AI 맞춤)", values: { free: true, pro: true } },
  { label: "최근 틀린 문제 복습", values: { free: "7일", pro: "30일" } },
  { label: "실전 모의고사", desc: "기출기반·학교별·파이널", values: { free: false, pro: true } },
  { label: "AI 문제 검색", desc: "캡쳐 검색·출제 분석", values: { free: false, pro: true } },
  { label: "광고 제거", values: { free: false, pro: true } },
  { label: "1:1 문의 우선 답변", values: { free: false, pro: true } },
];

function formatWon(n: number) {
  return n.toLocaleString("ko-KR");
}

export function PricingClient() {
  const { user } = useAuth();
  const currentTierId = (user?.tier ?? "free") as TierId;
  const currentTier = TIERS.find((t) => t.id === currentTierId) ?? TIERS[0];
  const isAdmin = user?.role === "admin";

  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      {/* 현재 요금제 배지 */}
      {user ? (
        <section
          className={`mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 ${currentTier.rim} ${currentTier.headerBg} px-5 py-4 shadow-soft`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{currentTier.emoji}</span>
            <div>
              <p className="text-sm leading-6 text-slate-700">
                <span className="font-black text-ink">{user.name}</span>님은 현재{" "}
                <span className={`font-black ${currentTier.priceText}`}>{currentTier.label}</span>
                {" "}요금제입니다!
              </p>
              {isAdmin ? (
                <p className="mt-0.5 text-xs font-bold text-slate-500">관리자 계정은 모든 기능을 등급과 무관하게 이용할 수 있어요.</p>
              ) : currentTier.id === "pro" ? (
                <p className="mt-0.5 text-xs font-bold text-slate-500">PRO 기능을 모두 이용 중입니다. 광고 없이 학습하세요!</p>
              ) : (
                <p className="mt-0.5 text-xs font-bold text-slate-500">PRO로 업그레이드하면 실전 모의고사·AI 검색·광고 제거까지 누릴 수 있어요.</p>
              )}
            </div>
          </div>
          {!isAdmin && currentTier.id !== "pro" ? (
            <a
              href={KAKAO_OPEN_CHAT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-ink px-4 py-2 text-xs font-black text-white hover:bg-slate-700"
            >
              PRO 업그레이드 문의
            </a>
          ) : null}
        </section>
      ) : null}

      <section className="mb-8 text-center">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-600">Pricing</p>
        <h2 className="mt-1 text-3xl font-black text-ink">루트편입 요금제</h2>
        <p className="mt-2 text-sm text-slate-600">
          핵심 학습은 무료로, 실전·AI 기능과 광고 제거는 PRO 하나로 끝내세요.
        </p>
      </section>

      {/* 등급 카드 */}
      <section className="mb-8 grid gap-4 sm:grid-cols-2">
        {TIERS.map((t) => {
          const isPro = t.id === "pro";
          const isCurrent = !isAdmin && user && t.id === currentTier.id;
          return (
            <div
              key={t.id}
              className={`relative flex flex-col rounded-2xl border-2 ${t.rim} ${t.headerBg} p-6 ${
                isCurrent ? "shadow-xl ring-4 ring-brand-200" : isPro ? "shadow-lg ring-2 ring-amber-200" : "shadow-soft"
              }`}
            >
              {t.badge ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-amber-500 px-3 py-1 text-[10px] font-black tracking-wider text-white shadow-md">
                  ⭐ {t.badge}
                </span>
              ) : null}
              {isCurrent ? (
                <span
                  className={`absolute whitespace-nowrap rounded-full bg-brand-600 px-3 py-1 text-[10px] font-black tracking-wider text-white shadow-md ${
                    t.badge ? "right-3 top-3" : "-top-3 right-3"
                  }`}
                >
                  ✓ 이용 중
                </span>
              ) : null}
              <div className="text-3xl">{t.emoji}</div>
              <h3 className={`mt-2 text-2xl font-black ${t.priceText}`}>{t.label}</h3>
              <p className="mt-1 text-sm text-slate-600">{t.tagline}</p>
              <div className="mt-4 min-h-[3rem]">
                {t.price === 0 ? (
                  <div className={`text-3xl font-black ${t.priceText}`}>무료</div>
                ) : (
                  <div className={`text-3xl font-black ${t.priceText}`}>
                    월 {formatWon(t.price)}원
                  </div>
                )}
              </div>
              {isPro ? (
                <a
                  href={KAKAO_OPEN_CHAT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-amber-500 px-5 py-3 text-sm font-black text-white transition hover:bg-amber-600"
                >
                  PRO 시작하기
                </a>
              ) : (
                <div className="mt-5 inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-500">
                  가입 즉시 이용 가능
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* 비교 표 */}
      <section className="overflow-x-auto rounded-2xl border border-line bg-white shadow-soft">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line">
              <th className="sticky left-0 z-10 bg-white px-4 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                기능
              </th>
              {TIERS.map((t) => (
                <th
                  key={t.id}
                  className={`px-4 py-4 text-center text-sm font-black ${t.headerBg} ${t.priceText} ${
                    t.id === "pro" ? "border-x-2 border-amber-300" : ""
                  }`}
                >
                  {t.emoji} {t.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FEATURES.map((row, i) => (
              <tr key={row.label} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50 dark:bg-white/[0.03]"}>
                <td className="sticky left-0 z-10 bg-inherit px-4 py-3 text-left text-sm font-bold text-ink">
                  {row.label}
                  {row.desc ? <div className="mt-0.5 text-xs font-normal text-slate-500">{row.desc}</div> : null}
                </td>
                {TIERS.map((t) => {
                  const v = row.values[t.id];
                  const isPro = t.id === "pro";
                  return (
                    <td
                      key={t.id}
                      className={`px-4 py-3 text-center ${isPro ? "border-x-2 border-amber-200/70 bg-amber-50/30 dark:border-amber-500/30 dark:bg-amber-500/[0.07]" : ""}`}
                    >
                      {v === true ? (
                        <span className="text-xl font-black text-mint-600">O</span>
                      ) : v === false ? (
                        <span className="text-xl font-black text-slate-300">×</span>
                      ) : (
                        <span className="text-xs font-bold text-slate-700">{v}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 가입 안내 */}
      <section className="mt-8 rounded-2xl border border-line bg-white p-8 text-center shadow-soft">
        <h3 className="text-xl font-black text-ink">PRO 가입 문의</h3>
        <p className="mt-2 text-sm text-slate-600">
          가입은 카카오톡 오픈채팅으로 편하게 문의해 주세요. 평일 24시간 이내 답변드립니다.
        </p>
        <a
          href={KAKAO_OPEN_CHAT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#FEE500] px-6 py-3 text-sm font-black text-[#191600] transition hover:brightness-95"
        >
          💬 카카오톡 오픈채팅으로 문의하기
        </a>
        <p className="mt-3 text-[11px] text-slate-400">
          * 표시된 가격은 부가세 포함, 월 결제 기준입니다.
        </p>
      </section>
    </main>
  );
}
