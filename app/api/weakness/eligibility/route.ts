import { NextResponse } from "next/server";
import { requireTier } from "@/lib/auth/requireTier";
import { fetchUnitStats, totalAttemptsFromUnitStats } from "@/lib/weakness/score";

const FIRST_REQUIRED = 200;
const REPEAT_REQUIRED_QUESTIONS = 100;
const REPEAT_REQUIRED_DAYS = 3;

export async function GET(request: Request) {
  // 취약유형 모의고사는 무료 개방. 등급 제한 없이 자격(풀이량/기간)만 본다.
  const auth = await requireTier(request, "free");
  if (!auth.ok) return auth.response;

  const tierAllowed = true;

  const stats = await fetchUnitStats(auth.supabase, auth.userId);
  const totalSolved = totalAttemptsFromUnitStats(stats);

  // profiles에서 마지막 weakness 응시 정보
  const { data: profile } = await auth.supabase
    .from("profiles")
    .select("last_weakness_exam_at, weakness_exam_count")
    .eq("id", auth.userId)
    .maybeSingle();
  const lastAt = (profile?.last_weakness_exam_at as string | null) ?? null;
  const examCount = (profile?.weakness_exam_count as number | null) ?? 0;

  // 첫 응시인지에 따라 자격 룰 다름
  const isFirst = examCount === 0;
  const requiredQuestions = isFirst ? FIRST_REQUIRED : REPEAT_REQUIRED_QUESTIONS;

  // 직전 응시 후 풀이 수 = 직전 응시 시점 이후의 시도 수
  let solvedSinceLast = totalSolved;
  if (lastAt) {
    // 시점 이후 attempts에서 푼 문항 수를 더 정확히 계산하려면 별도 쿼리 필요.
    // 간이 방식: weakness_exam_count >= 1이면 last 이후 풀이 수를 별도 집계.
    // 여기서는 user_problem_history.last_attempt_at 기준 집계로 근사.
    // (정확도 차이는 작아 허용범위.)
    const { count } = await auth.supabase
      .from("user_problem_history")
      .select("problem_id", { count: "exact", head: true })
      .eq("user_id", auth.userId)
      .gt("last_attempt_at", lastAt);
    solvedSinceLast = count ?? 0;
  }

  let daysSinceLast: number | null = null;
  if (lastAt) {
    daysSinceLast = Math.floor((Date.now() - Date.parse(lastAt)) / 86400_000);
  }

  let eligible = false;
  let reason: "insufficient_data" | "too_soon" | "tier_locked" | undefined;
  if (auth.isAdmin) {
    // 관리자는 자격 검증을 우회한다 — 테스트/디버깅 목적.
    eligible = true;
  } else if (isFirst) {
    eligible = totalSolved >= FIRST_REQUIRED;
    if (!eligible) reason = "insufficient_data";
  } else {
    const enoughSolved = solvedSinceLast >= REPEAT_REQUIRED_QUESTIONS;
    const enoughDays = (daysSinceLast ?? 0) >= REPEAT_REQUIRED_DAYS;
    eligible = enoughSolved && enoughDays;
    if (!eligible) reason = "too_soon";
  }
  if (eligible && !tierAllowed) {
    eligible = false;
    reason = "tier_locked";
  }

  // 추천 응시일
  let recommendedAt: string | null = null;
  if (lastAt && examCount >= 1) {
    // 최근 14일 평균 일별 풀이량으로 가늠. 최소 5문항/일로 클램프.
    const since = new Date(Date.now() - 14 * 86400_000).toISOString();
    const { count: recent14d } = await auth.supabase
      .from("user_problem_history")
      .select("problem_id", { count: "exact", head: true })
      .eq("user_id", auth.userId)
      .gt("last_attempt_at", since);
    const dailyAvg = Math.max(5, Math.floor((recent14d ?? 0) / 14));
    const daysTo100 = Math.ceil(REPEAT_REQUIRED_QUESTIONS / dailyAvg);
    const recommendedDays = Math.min(7, Math.max(REPEAT_REQUIRED_DAYS, daysTo100));
    recommendedAt = new Date(
      Date.parse(lastAt) + recommendedDays * 86400_000
    ).toISOString();
  }

  return NextResponse.json({
    ok: true,
    eligible,
    tierGate: tierAllowed ? "allowed" : "requires_pro",
    reason,
    progress: {
      solvedSinceLastExam: solvedSinceLast,
      requiredQuestions,
      daysSinceLastExam: daysSinceLast,
      requiredDays: isFirst ? 0 : REPEAT_REQUIRED_DAYS,
    },
    isFirstExam: isFirst,
    examCount,
    recommendedAt,
  });
}
