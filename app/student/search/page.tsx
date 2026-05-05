"use client";

import Link from "next/link";

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
  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      {/* 잠금 배지 */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-2xl bg-[#0D1F3C] text-4xl">
          🔍
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-black text-amber-700">
          <span>⭐</span>
          <span>PRO 전용 기능</span>
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

      {/* 잠금 상태 업로드 UI */}
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
        {/* 잠금 오버레이 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm">
          <div className="text-3xl">🔒</div>
          <p className="mt-2 text-sm font-black text-ink">PRO 이상 결제 후 이용 가능합니다</p>
          <p className="mt-1 text-xs text-slate-500">현재 준비 중인 서비스입니다.</p>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-6 rounded-xl border border-brand-200 bg-brand-50 p-5 text-center">
        <p className="text-sm font-black text-ink">지금 무료로 시작하고, PRO를 기다려 보세요!</p>
        <p className="mt-1 text-xs text-slate-500">PRO 플랜 출시 시 가입자에게 먼저 알려드립니다.</p>
        <Link
          href="/student/exams"
          className="mt-4 inline-flex rounded-lg bg-brand-600 px-6 py-3 text-sm font-black text-white hover:bg-brand-700"
        >
          시험 목록으로
        </Link>
      </div>
    </main>
  );
}
