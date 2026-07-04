import { NextResponse } from "next/server";
import { requireTier } from "@/lib/auth/requireTier";

type CompleteWrongBody = {
  problemId?: unknown;
  problemIds?: unknown;
};

function normalizeProblemIds(body: CompleteWrongBody): string[] {
  const raw = Array.isArray(body.problemIds)
    ? body.problemIds
    : typeof body.problemId === "string"
      ? [body.problemId]
      : [];

  return Array.from(
    new Set(
      raw
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean)
    )
  ).slice(0, 200);
}

export async function POST(request: Request) {
  const auth = await requireTier(request, "free");
  if (!auth.ok) return auth.response;

  let body: CompleteWrongBody;
  try {
    body = (await request.json()) as CompleteWrongBody;
  } catch {
    return NextResponse.json({ ok: false, message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const problemIds = normalizeProblemIds(body);
  if (problemIds.length === 0) {
    return NextResponse.json({ ok: false, message: "학습 완료 처리할 문제가 없습니다." }, { status: 400 });
  }

  const completedAt = new Date().toISOString();
  const rows = problemIds.map((problemId) => ({
    user_id: auth.userId,
    problem_id: problemId,
    completed_at: completedAt,
  }));

  const { error } = await auth.supabase
    .from("student_wrong_question_completions")
    .upsert(rows, { onConflict: "user_id,problem_id" });

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, count: rows.length });
}
