import type { Metadata } from "next";
import { LandingClient } from "@/components/landing/LandingClient";

export const metadata: Metadata = {
  title: "루트편입 — 편입수학·편입영어 CBT",
  description:
    "실제 1타강사 현장조교가 만든 5,000+ 문항, AI 풀이·검색·튜터, 취약유형 맞춤 모의고사까지. 가입 1분, 신용카드 불필요.",
  alternates: { canonical: "https://routrans.com/" },
};

export default function HomePage() {
  return <LandingClient />;
}
