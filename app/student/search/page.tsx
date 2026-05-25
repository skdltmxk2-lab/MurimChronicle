"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { canUseTier } from "@/lib/auth/tierGuard";

const FEATURES = [
  {
    icon: "📸",
    title: "캡쳐로 문제 검색",
    desc: "시험지나 교재를 캡쳐하면 동일/유사 문제를 즉시 찾아드려요.",
  },
  {
    icon: "🏫",
    title: "출제 대학 분석",
    desc: "이 유형이 어느 학교에서 자주 출제되는지 통계로 알려드려요.",
  },
  {
    icon: "📝",
    title: "상세 해설 & 풀이법",
    desc: "단계별 풀이 과정과 핵심 개념을 정리해서 제공합니다.",
  },
  {
    icon: "✨",
    title: "추천 연습 문제",
    desc: "유사 유형의 추천 문제를 함께 풀어보며 완벽히 익혀요.",
  },
];

export default function SearchPage() {
  const { user } = useAuth();
  // PRO(및 관리자)는 이용 자격이 있다. 기능 자체는 아직 출시 준비 중.
  const isPro = canUseTier(user, "pro");

  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      {/* 배지 */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-2xl bg-[#0D1F3C] text-4xl">
          🔍
        </div>
        <div
          className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-black ${
            isPro ? "bg-mint-100 text-mint-700" : "bg-amber-100 text-amber-700"
          }`}
        >
          <span>⭐</span>
          <span>{isPro ? "PRO 이용 가능" : "PRO 전용 기능"}</span>
        </div>
        <h1 className="mt-4 text-3xl font-black text-ink">문제 검색</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          문제를 캡쳐하면 관련 문제·출제 대학·해설을 한 번에 제공하는
          <br />
          AI 기반 문제 검색 서비스입니다.
        </p>
      </div>

      {/* 기능 소개 */}
      <div className="mb-8 grid grid-cols-2 gap-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-xl border border-line bg-white p-4 shadow-soft"
          >
            <div className="mb-2 text-2xl">{f.icon}</div>
            <div className="text-sm font-black text-ink">{f.title}</div>
            <div className="mt-1 text-xs leading-5 text-slate-500">{f.desc}</div>
          </div>
        ))}
      </div>

      {/* 업로드 UI (출시 전까지 비활성) */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
        <div className="pointer-events-none select-none opacity-30">
          <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white text-3xl">
            📷
          </div>
          <p className="text-sm font-bold text-slate-500">
            여기에 문제 이미지를 업로드하세요
          </p>
          <p className="mt-1 text-xs text-slate-400">PNG · JPG · WEBP 지원</p>
        </div>
        {/* 오버레이 — 등급에 따라 다르게 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm">
          {isPro ? (
            <>
              <div className="text-3xl">🔜</div>
              <p className="mt-2 text-sm font-black text-ink">출시 준비 중입니다</p>
              <p className="mt-1 text-xs text-slate-500">PRO 회원님께 가장 먼저 열어드릴게요.</p>
            </>
          ) : (
            <>
              <div className="text-3xl">🔒</div>
              <p className="mt-2 text-sm font-black text-ink">PRO 전용 기능입니다</p>
              <p className="mt-1 text-xs text-slate-500">PRO로 업그레이드하면 이용할 수 있어요.</p>
            </>
          )}
        </div>
      </div>

      {/* CTA */}
      {isPro ? (
        <div className="mt-6 rounded-xl border border-mint-200 bg-mint-50 p-5 text-center">
          <p className="text-sm font-black text-ink">AI 문제 검색이 곧 열립니다!</p>
          <p className="mt-1 text-xs text-slate-500">출시되면 PRO 회원님께 가장 먼저 알려드립니다.</p>
          <Link
            href="/student/exams"
            className="mt-4 inline-flex rounded-lg bg-mint-600 px-6 py-3 text-sm font-black text-white hover:bg-mint-700"
          >
            시험 목록으로
          </Link>
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-brand-200 bg-brand-50 p-5 text-center">
          <p className="text-sm font-black text-ink">AI 문제 검색은 PRO 전용 기능이에요!</p>
          <p className="mt-1 text-xs text-slate-500">PRO로 업그레이드하면 출시 즉시 이용하실 수 있습니다.</p>
          <Link
            href="/student/pricing"
            className="mt-4 inline-flex rounded-lg bg-brand-600 px-6 py-3 text-sm font-black text-white hover:bg-brand-700"
          >
            요금제 보기
          </Link>
        </div>
      )}
    </main>
  );
}
