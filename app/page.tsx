import type { Metadata } from "next";
import { LandingClient } from "@/components/landing/LandingClient";
import {
  computeDisplayedUsers,
  formatQuestionStat,
} from "@/lib/stats/displayed";
import { fetchQuestionCount, fetchUserCount } from "@/lib/stats/serverFetch";

// 5분마다 가입자·문항 수 갱신 (페이지 단위 ISR)
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const qCount = await fetchQuestionCount();
  const qStat = formatQuestionStat(qCount); // "7,500+" 등
  return {
    title: "루트편입 — 편입수학·편입영어 CBT",
    description: `편입수학·편입영어 ${qStat} 문항, AI 풀이·검색·튜터, 취약유형 맞춤 모의고사까지. 가입 1분, 신용카드 불필요.`,
    alternates: { canonical: "https://routrans.com/" },
  };
}

export default async function HomePage() {
  const [actualUsers, qCount] = await Promise.all([
    fetchUserCount(),
    fetchQuestionCount(),
  ]);
  return (
    <LandingClient
      displayedUsers={computeDisplayedUsers(actualUsers)}
      questionStat={formatQuestionStat(qCount)}
    />
  );
}
