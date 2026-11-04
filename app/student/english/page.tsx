"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { EnglishWelcomeIntro, ENGLISH_INTRO_KEY } from "@/components/english/EnglishWelcomeIntro";
import { EnglishHeroCTAs } from "@/components/english/EnglishHeroCTAs";

type Feature = {
  title: string;
  desc: string;
  href?: string;
};

const FEATURES: Feature[] = [
  {
    title: "단어 테스트",
    desc: "단어 테스트 + 단어 학습을 한 곳에서",
    href: "/student/english/words",
  },
  {
    title: "단어 문제",
    desc: "문장 속 밑줄 친 단어의 유의어·반의어 고르기",
  },
  {
    title: "논리 문제",
    desc: "문장 배열·추론 등 논리 유형",
  },
  {
    title: "문법 문제",
    desc: "핵심 문법 포인트 객관식 문제",
  },
  {
    title: "독해 문제",
    desc: "짧은 지문 + 문항으로 독해 연습",
  },
];

export default function EnglishHomePage() {
  const { user, authChecked } = useAuth();
  const [introOpen, setIntroOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    try {
      if (!localStorage.getItem(ENGLISH_INTRO_KEY)) setIntroOpen(true);
    } catch {
      // 무시
    }
  }, [user]);

  if (!authChecked) return null;

  if (!user) {
    return (
      <main className="tz-study tz-study-guest">
        <section className="tz-study-login">
          <h1>로그인이 필요합니다</h1>
          <p>편입영어 학습을 이용하려면 로그인해 주세요.</p>
          <Link href="/student/register" className="tz-study-button">회원가입</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="tz-study tz-english">
      {introOpen ? <EnglishWelcomeIntro name={user.name} onClose={() => setIntroOpen(false)} /> : null}
      <header className="tz-study-heading tz-english-heading">
        <div><h1>편입영어 학습</h1><p>{user.name}님, 단어부터 차근차근 시작해요.</p></div>
      </header>
      <section className="tz-english-workspace" aria-label="단어 학습과 복습">
        {FEATURES.map((f) => f.href ? (
          <Link key={f.title} href={f.href} className="tz-english-primary">
            <div className="tz-english-primary-top"><h2>{f.title}</h2><span>학습 가능</span></div>
            <p className="tz-english-primary-desc">{f.desc}</p>
            <div className="tz-english-primary-bottom"><p>단어부터 차근차근</p><span className="tz-study-button">시작하기</span></div>
          </Link>
        ) : null)}
        <div className="tz-english-review">
          <h2>배운 단어, <br />다시 확인하기.</h2>
          <EnglishHeroCTAs />
        </div>
      </section>
      <section className="tz-english-upcoming" aria-labelledby="tz-english-upcoming-title">
        <div className="tz-study-section-heading"><h2 id="tz-english-upcoming-title">학습 유형</h2><span>준비 중인 학습</span></div>
        <div className="tz-english-upcoming-grid">
          {FEATURES.filter((f) => !f.href).map((f) => (
            <article className="tz-english-upcoming-item" key={f.title}>
              <div><h3>{f.title}</h3><span>준비 중</span></div>
              <p>{f.desc}</p>
              <p className="tz-study-footnote">곧 제공됩니다</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
