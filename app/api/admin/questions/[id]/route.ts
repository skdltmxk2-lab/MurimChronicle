import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { deleteQuestion, fromQuestionDb, updateQuestion } from "@/lib/questions/serverQuestionRepository";
import type { QuestionDraft } from "@/types/question";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ ok: false, message: "문제 ID가 필요합니다." }, { status: 400 });
  }

  try {
    const { data, error } = await auth.supabase
      .from("questions")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ ok: false, message: "문제를 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, question: fromQuestionDb(data) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "문제를 불러오지 못했습니다.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ ok: false, message: "문제 ID가 필요합니다." }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as { draft?: QuestionDraft } | null;
  if (!body?.draft) {
    return NextResponse.json({ ok: false, message: "문제 데이터가 필요합니다." }, { status: 400 });
  }

  try {
    await updateQuestion(auth.supabase, id, body.draft);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "문제 수정에 실패했습니다.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ ok: false, message: "문제 ID가 필요합니다." }, { status: 400 });
  }

  try {
    await deleteQuestion(auth.supabase, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "문제 삭제에 실패했습니다.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
