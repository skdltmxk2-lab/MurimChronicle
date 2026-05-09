import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";

type AttemptRow = {
  attempt_id: string;
  exam_id: string;
  exam_type: string | null;
  result: { items?: Array<{ isCorrect?: boolean; problemId?: string }> } | null;
  created_at: string;
};

type UnitStatRow = {
  subject: string;
  unit: string;
  total: number;
  wrong: number;
  accuracy: number;
  last_attempt_at: string;
};

type Category = "weakness" | "subject-mock" | "unit-test" | "daily" | "real";

function classify(examId: string): Category {
  if (examId.startsWith("weakness-")) return "weakness";
  if (examId.startsWith("subject-mock")) return "subject-mock";
  if (examId.startsWith("unit-test-")) return "unit-test";
  if (examId.startsWith("unit-daily-")) return "daily";
  return "real";
}

const CATEGORY_LABELS: Record<Category, string> = {
  weakness: "취약유형 모의고사",
  "subject-mock": "과목별 모의고사",
  "unit-test": "단원별 학습",
  daily: "데일리 테스트",
  real: "실전 모의고사",
};

function shortTitle(category: Category, examId: string): string {
  if (category === "daily") {
    const m = examId.match(/^unit-daily-(\d{4}-\d{2}-\d{2})$/);
    if (m) return `데일리 ${m[1]}`;
    return "데일리";
  }
  if (category === "weakness") return "취약유형 모의고사";
  if (category === "subject-mock") {
    // subject-mock:과목명:회차
    const parts = examId.split(":");
    if (parts.length >= 3) return `${parts[1]} 모의고사 ${parts[2]}회`;
    return "과목별 모의고사";
  }
  if (category === "unit-test") return "단원별 학습";
  return examId; // real mock
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ ok: false, message: "사용자 ID가 필요합니다." }, { status: 400 });
  }

  const supabase = auth.supabase;

  // 회원 기본정보
  const { data: authUser } = await supabase.auth.admin.getUserById(id);
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, tier, is_admin")
    .eq("id", id)
    .maybeSingle();

  // 시험 시도 전체
  const { data: attemptsRaw, error: aErr } = await supabase
    .from("exam_attempts")
    .select("attempt_id, exam_id, exam_type, result, created_at")
    .eq("user_id", id)
    .order("created_at", { ascending: false });
  if (aErr) {
    return NextResponse.json({ ok: false, message: aErr.message }, { status: 500 });
  }
  const attempts = (attemptsRaw ?? []) as AttemptRow[];

  // 카테고리별 카운트 + 총 푼 문제 수 + 정답/오답
  const categoryCounts: Record<Category, number> = {
    weakness: 0,
    "subject-mock": 0,
    "unit-test": 0,
    daily: 0,
    real: 0,
  };
  let totalProblems = 0;
  let totalCorrect = 0;
  for (const a of attempts) {
    const cat = classify(a.exam_id);
    categoryCounts[cat]++;
    const items = a.result?.items ?? [];
    totalProblems += items.length;
    totalCorrect += items.filter((i) => i.isCorrect).length;
  }

  // 최근 10개 요약
  const recent = attempts.slice(0, 10).map((a) => {
    const cat = classify(a.exam_id);
    const items = a.result?.items ?? [];
    const correct = items.filter((i) => i.isCorrect).length;
    return {
      attemptId: a.attempt_id,
      examId: a.exam_id,
      category: cat,
      categoryLabel: CATEGORY_LABELS[cat],
      title: shortTitle(cat, a.exam_id),
      problems: items.length,
      correct,
      wrong: items.length - correct,
      accuracy: items.length > 0 ? correct / items.length : 0,
      takenAt: a.created_at,
    };
  });

  // 단원별 통계
  const { data: unitStatsRaw, error: uErr } = await supabase
    .from("user_unit_stats")
    .select("subject, unit, total, wrong, accuracy, last_attempt_at")
    .eq("user_id", id);
  if (uErr) {
    return NextResponse.json({ ok: false, message: uErr.message }, { status: 500 });
  }
  const unitStats = (unitStatsRaw ?? []) as UnitStatRow[];

  // 과목별 집계
  const bySubjectMap = new Map<string, { subject: string; total: number; wrong: number }>();
  for (const s of unitStats) {
    const cur = bySubjectMap.get(s.subject) ?? { subject: s.subject, total: 0, wrong: 0 };
    cur.total += s.total;
    cur.wrong += s.wrong;
    bySubjectMap.set(s.subject, cur);
  }
  const bySubject = [...bySubjectMap.values()]
    .map((s) => ({
      ...s,
      correct: s.total - s.wrong,
      accuracy: s.total > 0 ? (s.total - s.wrong) / s.total : 0,
    }))
    .sort((a, b) => b.total - a.total);

  // 가장 취약한 단원 5개 (총 시도 ≥ 3, accuracy 낮은 순)
  const weakestUnits = unitStats
    .filter((s) => s.total >= 3)
    .sort((a, b) => a.accuracy - b.accuracy || b.wrong - a.wrong)
    .slice(0, 5);

  // 가장 잘하는 단원 5개 (총 시도 ≥ 3, accuracy 높은 순)
  const bestUnits = unitStats
    .filter((s) => s.total >= 3)
    .sort((a, b) => b.accuracy - a.accuracy || b.total - a.total)
    .slice(0, 5);

  return NextResponse.json({
    ok: true,
    user: {
      id,
      email: authUser?.user?.email ?? "",
      name: profile?.name ?? "",
      tier: profile?.tier ?? "free",
      isAdmin: Boolean(profile?.is_admin),
    },
    summary: {
      totalAttempts: attempts.length,
      totalProblems,
      totalCorrect,
      totalWrong: totalProblems - totalCorrect,
      accuracy: totalProblems > 0 ? totalCorrect / totalProblems : 0,
      categoryCounts,
      categoryLabels: CATEGORY_LABELS,
    },
    recentAttempts: recent,
    weakness: {
      bySubject,
      weakestUnits,
      bestUnits,
      allUnits: unitStats.sort((a, b) => a.accuracy - b.accuracy),
    },
  });
}
