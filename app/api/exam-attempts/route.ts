import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import type { AttemptResult } from "@/types/exam";

function isAttemptResult(value: unknown): value is AttemptResult {
  if (!value || typeof value !== "object") return false;
  const result = value as Partial<AttemptResult>;
  return (
    typeof result.attemptId === "string" &&
    result.attemptId.length > 0 &&
    typeof result.examId === "string" &&
    result.examId.length > 0 &&
    typeof result.submittedAt === "string" &&
    Array.isArray(result.items)
  );
}

export async function POST(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "잘못된 요청입니다." }, { status: 400 });
  }

  const result = (body as { result?: unknown }).result;
  if (!isAttemptResult(result)) {
    return NextResponse.json({ ok: false, message: "시험 결과 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const { error } = await auth.supabase.from("exam_attempts").insert({
    attempt_id: result.attemptId,
    user_id: auth.userId,
    exam_id: result.examId,
    result,
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
