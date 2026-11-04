"use client";

import { useRouter } from "next/navigation";

export const ENGLISH_INTRO_KEY = "cbt:english:intro:v1";

export function EnglishWelcomeIntro({
  name,
  onClose,
}: {
  name?: string;
  onClose: () => void;
}) {
  const router = useRouter();

  function markSeen() {
    try {
      localStorage.setItem(ENGLISH_INTRO_KEY, "1");
    } catch {
      // 무시
    }
  }

  function start() {
    markSeen();
    onClose();
    router.push("/student/english/words");
  }

  function dismiss() {
    markSeen();
    onClose();
  }

  return (
    <div className="tz-english-intro" role="dialog" aria-modal="true" aria-labelledby="tz-english-intro-title" aria-describedby="tz-english-intro-description">
      <section className="tz-english-intro__sheet">
        <h1 id="tz-english-intro-title">{name ? `${name}님, 환영해요!` : "환영해요!"}</h1>
        <p id="tz-english-intro-description" className="tz-english-intro__description">
          편입영어는 아직 <b>개발 중인 단계</b>예요.<br />
          우선 <b>단어 학습</b>부터 진행해 주세요.<br />
          얼른 더 많은 기능과 문제를 추가하겠습니다!
        </p>
        <div className="tz-english-intro__actions">
          <button type="button" onClick={start} className="tz-welcome__start">단어 학습 시작하기</button>
          <button type="button" onClick={dismiss} className="tz-english-intro__dismiss">둘러볼게요</button>
        </div>
        <p className="tz-english-intro__destination">ROUTE 편입영어</p>
      </section>
    </div>
  );
}
