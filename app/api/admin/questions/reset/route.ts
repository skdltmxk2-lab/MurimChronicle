import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { resetQuestions } from "@/lib/questions/serverQuestionRepository";

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const questions = await resetQuestions(auth.supabase);
    return NextResponse.json({ ok: true, questions });
  } catch (error) {
    const message = error instanceof Error ? error.message : "문제 초기화에 실패했습니다.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
