"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { isAdminUser } from "@/lib/auth/mockAuth";
import { adminFetch } from "@/lib/api/adminFetch";

type Stats = {
  inquiriesPending: number;
  inquiriesNew: number;
  totalQuestions: number;
  totalUsers: number;
};

type Card = {
  href: string;
  title: string;
  desc: string;
  emoji: string;
  badge?: number;
  highlight?: boolean;
};

export function AdminHomeClient() {
  const { user, authChecked } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  async function loadStats() {
    try {
      const res = await adminFetch("/api/admin/stats");
      const json = (await res.json()) as { ok: boolean } & Partial<Stats>;
      if (json.ok) {
        setStats({
          inquiriesPending: json.inquiriesPending ?? 0,
          inquiriesNew: json.inquiriesNew ?? 0,
          totalQuestions: json.totalQuestions ?? 0,
          totalUsers: json.totalUsers ?? 0,
        });
      }
    } catch {
      // 무시
    }
  }

  useEffect(() => {
    if (!authChecked || !isAdminUser(user)) return;
    loadStats();
  }, [authChecked, user]);

  if (!authChecked) return null;
  if (!isAdminUser(user)) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-16">
        <section className="mx-auto max-w-lg rounded-2xl border border-line bg-white p-10 text-center shadow-soft">
          <div className="mb-5 text-5xl">🔒</div>
          <h1 className="text-2xl font-black text-ink">관리자만 접근할 수 있습니다</h1>
          <Link href="/student/exams" className="mt-6 inline-block rounded-md bg-brand-600 px-6 py-3 text-sm font-black text-white hover:bg-brand-700">
            학생 화면으로
          </Link>
        </section>
      </main>
    );
  }

  const cards: Card[] = [
    {
      href: "/admin/inquiries",
      title: "문의함",
      desc: stats ? (stats.inquiriesPending > 0 ? `처리해야 할 문의 ${stats.inquiriesPending}건` : "처리할 문의 없음") : "회원의 문의·건의·버그신고",
      emoji: "📨",
      badge: stats?.inquiriesNew,
      highlight: (stats?.inquiriesNew ?? 0) > 0,
    },
    {
      href: "/admin/questions",
      title: "문제 관리",
      desc: stats ? `등록된 문제 ${stats.totalQuestions.toLocaleString()}개` : "문제 등록·수정·삭제",
      emoji: "📚",
    },
    {
      href: "/admin/exams",
      title: "모의고사 생성",
      desc: "실전 모의고사 출제·발행",
      emoji: "📝",
    },
    {
      href: "/admin/daily",
      title: "데일리 테스트 생성",
      desc: "오늘의 5문항 풀 관리",
      emoji: "📅",
    },
    {
      href: "/admin/coaching",
      title: "코칭 스튜디오",
      desc: "관련문제 PDF·단원 모고·쌍둥이 문제 자동 구성",
      emoji: "🎯",
    },
    {
      href: "/admin/messages",
      title: "공지 / 메시지",
      desc: "전체 공지 및 1대1 메시지 발송",
      emoji: "📢",
    },
    {
      href: "/admin/users",
      title: "회원 관리",
      desc: stats ? `가입자 ${stats.totalUsers}명` : "등급 변경·관리자 임명·상세 분석",
      emoji: "👥",
    },
    {
      href: "/admin/imports",
      title: "대량 업로드",
      desc: "CSV·JSON 일괄 등록",
      emoji: "📥",
    },
    {
      href: "/admin/ai",
      title: "AI 추천 설정",
      desc: "추천 엔진(개념/임베딩) 선택·임베딩 생성",
      emoji: "🧬",
    },
  ];

  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <section className="mb-6 rounded-lg border border-line bg-white p-6 shadow-soft">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-600">관리자 콘솔</p>
        <h1 className="mt-1 text-3xl font-black text-ink">
          {user?.name}님, 환영합니다
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          좌측 카드에서 작업할 영역을 선택하세요. 새 문의가 있으면 ‘문의함’에 알림 배지가 표시됩니다.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className={`group relative flex h-full flex-col rounded-xl border bg-white p-6 shadow-soft transition hover:-translate-y-0.5 hover:border-brand-600 hover:shadow-lg ${
              c.highlight ? "border-coral-300 bg-coral-50/40" : "border-line"
            }`}
          >
            {c.badge && c.badge > 0 ? (
              <span className="absolute right-4 top-4 grid min-w-7 place-items-center rounded-full bg-coral-600 px-2 py-0.5 text-xs font-black text-white shadow-md">
                +{c.badge}
              </span>
            ) : null}
            <div className="text-4xl">{c.emoji}</div>
            <h2 className="mt-3 text-lg font-black text-ink">{c.title}</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">{c.desc}</p>
            <div className="mt-auto pt-5 text-xs font-black text-brand-700 group-hover:text-brand-800">
              열기 →
            </div>
          </Link>
        ))}
      </section>

      {/* 편입영어 (수학과 별도) */}
      <section className="mt-12">
        <h2 className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-brand-600">편입영어</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/english"
            className="group flex h-full flex-col rounded-xl border border-line bg-white p-6 shadow-soft transition hover:-translate-y-0.5 hover:border-brand-600 hover:shadow-lg"
          >
            <div className="text-4xl">🔤</div>
            <h2 className="mt-3 text-lg font-black text-ink">영어 단어 DB</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">단어 일괄 등록·관리 (단어 테스트용)</p>
            <div className="mt-auto pt-5 text-xs font-black text-brand-700 group-hover:text-brand-800">열기 →</div>
          </Link>
        </div>
      </section>
    </main>
  );
}
