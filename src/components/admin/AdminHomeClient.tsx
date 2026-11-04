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
  icon: ToolIconName;
  badge?: number;
  highlight?: boolean;
};

type ToolIconName = "appearance" | "electronics" | "inquiries" | "questions" | "exams" | "daily" | "coaching" | "homework" | "messages" | "users" | "imports" | "ai" | "english" | "lock";

const TOOL_ICONS: Record<ToolIconName, string> = {
  appearance: "M4 4h16v16H4V4Zm0 6h16M10 10v10m4-6h2m-2 3h2",
  electronics: "M9 3v4m6-4v4M7 7h10v4a5 5 0 0 1-5 5v5m-5-9h10",
  inquiries: "M4 5h16v12H9l-5 4V5Zm4 4h8m-8 4h5",
  questions: "M4 4h6l2 2 2-2h6v15h-6l-2 2-2-2H4V4Zm8 2v15",
  exams: "M8 4H5v17h14V4h-3M8 2h8v5H8V2Zm0 10h8m-8 4h5",
  daily: "M4 5h16v16H4V5Zm3-3v6m10-6v6M4 11h16m-12 4h2m4 0h2",
  coaching: "M20 12a8 8 0 1 1-8-8m4 0h4v4m0-4-8 8m3 0a3 3 0 1 1-3-3",
  homework: "M6 3h8l4 4v14H6V3Zm8 0v5h4M9 12h6m-6 4h6",
  messages: "M3 10v5h4l9 4V6l-9 4H3Zm4 5 2 6h3l-2-5m9-7 2-2m-2 9 2 2",
  users: "M15 21v-2a5 5 0 0 0-10 0v2m12-7a4 4 0 0 1 4 4v3M10 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm7 0a4 4 0 0 1 0 8",
  imports: "M4 15v6h16v-6M12 3v13m-5-8 5-5 5 5",
  ai: "M8 3v3m8-3v3M8 18v3m8-3v3M3 8h3m12 0h3M3 16h3m12 0h3M6 6h12v12H6V6Zm4 4h4v4h-4v-4Z",
  english: "m3 19 5-14 5 14M5 14h6m4-7h6m-3-3v3m-3 4c1 3 3 5 6 7m0-7c-1 3-3 5-6 7",
  lock: "M6 10h12v11H6V10Zm3 0V6a3 3 0 0 1 6 0v4m-3 4v3",
};

function ToolIcon({ name }: { name: ToolIconName }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true">
      <path d={TOOL_ICONS[name]} />
    </svg>
  );
}

function OpenIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M4 10h12m-5-5 5 5-5 5" />
    </svg>
  );
}

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
      <main className="tz-admin-home">
        <section className="tz-admin-home-access">
          <span className="tz-admin-home-access-icon"><ToolIcon name="lock" /></span>
          <h1>관리자만 접근할 수 있습니다</h1>
          <Link href="/student/exams" className="tz-admin-home-access-link">
            학생 화면으로
          </Link>
        </section>
      </main>
    );
  }

  const cards: Card[] = [
    {
      href: "/admin/appearance",
      title: "사이트 디자인",
      desc: "Hallmark 디자인 선택·미리보기와 사이트 전체 적용",
      icon: "appearance",
    },
    {
      href: "/admin/electronics",
      title: "전자공학 실험실",
      desc: "실험 PDF·사진 분석, 빵판 자동 배치와 조립 안내",
      icon: "electronics",
    },
    {
      href: "/admin/inquiries",
      title: "문의함",
      desc: stats ? (stats.inquiriesPending > 0 ? `처리해야 할 문의 ${stats.inquiriesPending}건` : "처리할 문의 없음") : "회원의 문의·건의·버그신고",
      icon: "inquiries",
      badge: stats?.inquiriesNew,
      highlight: (stats?.inquiriesNew ?? 0) > 0,
    },
    {
      href: "/admin/questions",
      title: "문제 관리",
      desc: stats ? `등록된 문제 ${stats.totalQuestions.toLocaleString()}개` : "문제 등록·수정·삭제",
      icon: "questions",
    },
    {
      href: "/admin/exams",
      title: "모의고사 생성",
      desc: "실전 모의고사 출제·발행",
      icon: "exams",
    },
    {
      href: "/admin/daily",
      title: "데일리 테스트 생성",
      desc: "오늘의 5문항 풀 관리",
      icon: "daily",
    },
    {
      href: "/admin/coaching",
      title: "코칭 스튜디오",
      desc: "관련문제 PDF·단원 모고·쌍둥이 문제 자동 구성",
      icon: "coaching",
    },
    {
      href: "/admin/homework",
      title: "숙제 배부 / 첨삭",
      desc: "PDF 자료 배부·풀이 제출·문항별 AI 피드백 검토",
      icon: "homework",
    },
    {
      href: "/admin/messages",
      title: "공지 / 메시지",
      desc: "전체 공지 및 1대1 메시지 발송",
      icon: "messages",
    },
    {
      href: "/admin/users",
      title: "회원 관리",
      desc: stats ? `가입자 ${stats.totalUsers}명` : "등급 변경·관리자 임명·상세 분석",
      icon: "users",
    },
    {
      href: "/admin/imports",
      title: "대량 업로드",
      desc: "CSV·JSON 일괄 등록",
      icon: "imports",
    },
    {
      href: "/admin/ai",
      title: "AI 추천 설정",
      desc: "추천 엔진(개념/임베딩) 선택·임베딩 생성",
      icon: "ai",
    },
  ];

  return (
    <main className="tz-admin-home">
      <section className="tz-admin-home-intro">
        <h1>
          {user?.name}님, 환영합니다
        </h1>
        <p>
          작업할 영역을 선택하세요. 새 문의가 있으면 ‘문의함’에 알림 배지가 표시됩니다.
        </p>
      </section>

      <section className="tz-admin-home-grid" aria-label="관리 도구">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="tz-admin-home-card"
            data-attention={c.highlight || undefined}
          >
            <div className="tz-admin-home-card-top">
              <span className="tz-admin-home-icon"><ToolIcon name={c.icon} /></span>
              {c.badge && c.badge > 0 ? (
                <span className="tz-admin-home-badge" aria-label={`새 문의 ${c.badge}건`}>
                  +{c.badge}
                </span>
              ) : null}
            </div>
            <h2>{c.title}</h2>
            <p>{c.desc}</p>
            <span className="tz-admin-home-open" aria-hidden="true"><OpenIcon /></span>
          </Link>
        ))}
      </section>

      {/* 편입영어 (수학과 별도) */}
      <section className="tz-admin-home-english" aria-labelledby="tz-admin-english-title">
        <h2 id="tz-admin-english-title">편입영어</h2>
        <div className="tz-admin-home-grid">
          <Link
            href="/admin/english"
            className="tz-admin-home-card"
          >
            <div className="tz-admin-home-card-top"><span className="tz-admin-home-icon"><ToolIcon name="english" /></span></div>
            <h3>영어 단어 DB</h3>
            <p>단어 일괄 등록·관리 (단어 테스트용)</p>
            <span className="tz-admin-home-open" aria-hidden="true"><OpenIcon /></span>
          </Link>
        </div>
      </section>
    </main>
  );
}
