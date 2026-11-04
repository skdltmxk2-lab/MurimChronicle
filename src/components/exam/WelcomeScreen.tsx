"use client";

import type { MockUser } from "@/types/auth";

export function WelcomeScreen({ user, onDone }: { user: MockUser; onDone: () => void }) {
  const messages = [
    `안녕하세요, ${user.name}님!`,
    `${user.name}님이 많이 틀리시는 유형을 학습해`,
    "최적의 편입수학 공부를 돕는",
    "루트편입입니다!",
    "함께 공부를 시작해볼까요?",
  ];


  return (
    <main className="tz-welcome">
      <section className="tz-welcome__sheet" aria-label="루트편입 학습 시작">
        <h1>{messages[0]}</h1>
        <div className="tz-welcome__copy">{messages.slice(1).map((message) => <p key={message}>{message}</p>)}</div>
        <button type="button" onClick={onDone} className="tz-welcome__start">시작하기</button>
      </section>
    </main>
  );
}
