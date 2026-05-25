"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { canUseTier } from "@/lib/auth/tierGuard";
import { AiSearchClient } from "@/components/student/AiSearchClient";

const FEATURES = [
  {
    icon: "📸",
    title: "캡쳐로 문제 검색",
    desc: "시험지나 교재를 캡쳐하면 동일/유사 문제를 즉시 찾아드려요.",
  },
  {
    icon: "🏫",
    title: "유형·단원 자동 분석",
    desc: "어떤 과목·단원·개념의 문제인지 AI가 분석해 알려드려요.",
  },
  {
    icon: "📝",
    title: "상세 해설 & 풀이법",
    desc: "추천 문제의 정답과 단계별 해설을 함께 제공합니다.",
  },
  {
    icon: "🤖",
    title: "AI 튜터 질문",
    desc: "풀이가 막히면 AI 튜터에게 바로 물어볼 수 있어요.",
  },
];

export default function SearchPage() {
  const { user, authChecked } = useAuth();

  if (!authChecked) return null;

  const isPro = canUseTier(user, "pro");

  // PRO / 관리자 → 실제 AI 문제검색 도구
  if (isPro) {
    return <AiSearchClient />;
  }

  // 무료 사용자 → PRO 업그레이드 안내
  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-2xl bg-[#0D1F3C] text-4xl">
          🔍
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-black text-amber-700">
          <span>⭐</span>
          <span>PRO 전용 기능</span>
        </div>
        <h1 className="mt-4 text-3xl font-black text-ink">AI 문제 검색</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          문제를 캡쳐하면 관련 문제·해설을 찾아주고 AI 튜터에게 풀이를 물어볼 수 있는
          <br />
          PRO 전용 AI 기능입니다.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-xl border border-line bg-white p-4 shadow-soft">
            <div className="mb-2 text-2xl">{f.icon}</div>
            <div className="text-sm font-black text-ink">{f.title}</div>
            <div className="mt-1 text-xs leading-5 text-slate-500">{f.desc}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-brand-200 bg-brand-50 p-5 text-center">
        <p className="text-sm font-black text-ink">PRO로 업그레이드하면 바로 이용할 수 있어요!</p>
        <p className="mt-1 text-xs text-slate-500">광고 없이, 실전 모의고사·30일 오답복습까지 함께 제공됩니다.</p>
        <Link
          href="/student/pricing"
          className="mt-4 inline-flex rounded-lg bg-brand-600 px-6 py-3 text-sm font-black text-white hover:bg-brand-700"
        >
          요금제 보기
        </Link>
      </div>
    </main>
  );
}
