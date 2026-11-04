"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { StudentHeader } from "@/components/layout/StudentHeader";
import { StudentFooter } from "@/components/layout/StudentFooter";

type Feature = { title: string; desc: string };

const FEATURES: Feature[] = [
  { title: "단원별 학습", desc: "5과목에서 단원을 골라 10, 15, 20문항. 한 번 본 문제는 뒤로 밀려요." },
  { title: "과목별 모의고사", desc: "한 과목 20문항을 50분 안에. 시간 압박 속 실력 점검." },
  { title: "실전 모의고사", desc: "5과목 × 5문항 = 25문항 실전형. 기출, 학교별, 파이널 4종." },
  { title: "AI 취약유형 모의고사", desc: "내가 자주 틀리는 유형을 분석해 25문항 맞춤 출제." },
  { title: "데일리 테스트", desc: "월별 커리큘럼에 맞춰 5문항씩 매일. 누적 학습." },
  { title: "AI 문제 검색, 풀이, 튜터", desc: "캡쳐 한 장으로 유사 문제와 AI 풀이, 1:1 질문. (PRO)" },
  { title: "편입영어 단어 테스트", desc: "4지선다 + 틀린 단어 모음. 단어부터 차근차근." },
  { title: "오답·학습 기록", desc: "최근 오답과 취약 단원을 모아 다음 학습으로 바로 이어집니다." },
];

const STUDY_FLOW = [
  ["단원별 문제 풀이", "과목과 단원을 고르면 바로 문제를 풀 수 있습니다."],
  ["오답·해설 확인", "틀린 문제는 해설과 함께 다시 볼 수 있습니다."],
  ["취약유형 재구성", "누적 기록을 바탕으로 다음 모의고사를 구성합니다."],
];

const FREE_FEATURES = [
  "단원별 학습 (무제한)", "과목별 모의고사", "데일리 테스트",
  "AI 취약유형 모의고사", "오답 복습 7일",
];
const PRO_FEATURES = [
  "Free 모든 기능", "실전 모의고사 (기출, 학교별, 파이널)",
  "AI 문제 검색, 풀이, 튜터", "광고 제거", "오답 복습 30일", "실전 학습 기록 확장",
];

export function LandingClient({ displayedUsers, questionStat }: {
  displayedUsers: number;
  questionStat: string;
}) {
  const router = useRouter();
  const { user, authChecked } = useAuth();

  const STATS = [
    { label: "등록 문항", value: questionStat },
    { label: "기출 학교", value: "28개" },
    { label: "사용 중인 학생", value: `${displayedUsers.toLocaleString("ko-KR")}명` },
    { label: "문항·해설 품질 점검", value: "상시" },
  ];

  // 이미 로그인된 사용자는 마케팅 랜딩 대신 학습 페이지로
  useEffect(() => {
    if (authChecked && user) {
      router.replace("/student/exams");
    }
  }, [authChecked, user, router]);

  // 로그인 상태 판정 전엔 빈 화면 (FOUC 방지)
  if (!authChecked) return null;
  if (user) return null;

  return (
    <div className="tz-landing">
      <StudentHeader />
      <main className="tz-landing-main">
        <section className="tz-landing-hero" aria-labelledby="tz-landing-title">
          <div className="tz-landing-container tz-landing-hero-grid">
            <div className="tz-landing-hero-copy">
              <h1 id="tz-landing-title">편입 합격까지,<br />가장 빠른 길.</h1>
              <p className="tz-landing-lead">편입수학·편입영어 {questionStat} 문항.<br className="tz-landing-lead-break" />{" "}AI 풀이, 검색, 튜터부터 취약유형 맞춤 모의고사까지 한 곳에서.</p>
              <div className="tz-landing-actions">
                <Link href="/student/register" className="tz-landing-button">무료로 시작하기</Link>
                <Link href="/student/pricing" className="tz-landing-button tz-landing-button-quiet">PRO 알아보기</Link>
              </div>
            </div>
            <figure className="tz-landing-product">
              <div className="tz-landing-product-image" data-slot="study" data-kind="product" data-alt="루트편입의 실제 학습 화면">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="tz-landing-capture-light" src="/hallmark/study-light.png" width="1376" height="1004" alt="문제와 답안을 한 곳에서 확인하는 루트편입 학습 화면" fetchPriority="high" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="tz-landing-capture-dark" src="/hallmark/study-dark.png" width="1376" height="1004" alt="어두운 테마의 루트편입 학습 화면" fetchPriority="high" />
              </div>
              <figcaption><span>루트편입 CBT</span><span>학습 화면 예시</span></figcaption>
            </figure>
          </div>
        </section>

        <section className="tz-landing-facts" aria-label="루트편입 학습 현황">
          <dl className="tz-landing-container tz-landing-fact-grid">
            {STATS.map((stat) => (
              <div key={stat.label}><dt>{stat.label}</dt><dd>{stat.value}</dd></div>
            ))}
          </dl>
        </section>

        <section className="tz-landing-tools" aria-labelledby="tz-landing-tools-title">
          <div className="tz-landing-container">
            <div className="tz-landing-section-head">
              <h2 id="tz-landing-tools-title">필요한 모든 학습 도구,<br />한 사이트에.</h2>
              <p>단원별 학습부터 실전 모의고사, AI 도우미와 단어 테스트까지. 별도 앱·교재 없이 끝.</p>
            </div>
            <div className="tz-landing-drawer">
              {FEATURES.map((feature, index) => (
                <article className={`tz-landing-feature tz-landing-feature-${index + 1}`} key={feature.title}>
                  <h3>{feature.title}</h3>
                  <p>{feature.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="tz-landing-flow" aria-labelledby="tz-landing-flow-title">
          <div className="tz-landing-container tz-landing-flow-grid">
            <h2 id="tz-landing-flow-title">풀고, 확인하고,<br />다시 뽑는 흐름.</h2>
            <ol className="tz-landing-flow-list">
              {STUDY_FLOW.map(([title, desc]) => (
                <li key={title}><div><h3>{title}</h3><p>{desc}</p></div></li>
              ))}
            </ol>
          </div>
        </section>

        <section className="tz-landing-pricing" aria-labelledby="tz-landing-pricing-title">
          <div className="tz-landing-container">
            <div className="tz-landing-section-head tz-landing-pricing-head">
              <h2 id="tz-landing-pricing-title">핵심은 무료,<br />실전은 PRO.</h2>
              <Link href="/student/pricing" className="tz-landing-text-link">가격 자세히 비교하기</Link>
            </div>
            <div className="tz-landing-plans">
              <article className="tz-landing-plan" aria-labelledby="tz-landing-free-title">
                <div className="tz-landing-plan-title"><h3 id="tz-landing-free-title">Free</h3><p>핵심 학습 기능을 무료로</p></div>
                <p className="tz-landing-price">무료</p>
                <ul>{FREE_FEATURES.map((feature) => <li key={feature}>{feature}</li>)}</ul>
              </article>
              <article className="tz-landing-plan tz-landing-plan-pro" aria-labelledby="tz-landing-pro-title">
                <div className="tz-landing-plan-title"><div className="tz-landing-plan-name"><h3 id="tz-landing-pro-title">Pro</h3><span className="tz-landing-plan-recommend">추천</span></div><p>광고 없이, 모든 기능을 한 번에</p></div>
                <p className="tz-landing-price"><small>월</small> 29,900원</p>
                <ul>{PRO_FEATURES.map((feature) => <li key={feature}>{feature}</li>)}</ul>
              </article>
            </div>
          </div>
        </section>

        <section className="tz-landing-start" aria-labelledby="tz-landing-start-title">
          <div className="tz-landing-container tz-landing-start-grid">
            <div><h2 id="tz-landing-start-title">지금 무료로 시작하고,<br />오늘부터 한 걸음 더.</h2><p>가입 1분, 신용카드 불필요, 데일리 5문항 바로 시작</p></div>
            <Link href="/student/register" className="tz-landing-button">무료로 시작하기</Link>
          </div>
        </section>
      </main>
      <StudentFooter />
    </div>
  );
}
