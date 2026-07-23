import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { appendQuestions, createQuestion, fromQuestionDb } from "@/lib/questions/serverQuestionRepository";
import type { QuestionDraft } from "@/types/question";

const ADMIN_QUESTION_LIST_COLUMNS = [
  "id",
  "subject",
  "unit",
  "concept",
  "difficulty",
  "source_type",
  "pool",
  "question",
  "content_type",
  "question_type",
  "options",
  "correct_option_id",
  "answer_text",
  "explanation",
  "explanation_content_type",
  "tags",
  "quality_status",
  "quality_reasons",
  "validated_at",
  "validator_version",
  "created_at",
  "updated_at"
].join(",");

type DbRow = Record<string, unknown>;

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const pageSize = 1000;
    const rows: DbRow[] = [];
    for (let from = 0; ; from += pageSize) {
      const { data, error } = await auth.supabase
        .from("questions")
        .select(ADMIN_QUESTION_LIST_COLUMNS)
        .order("created_at", { ascending: false })
        .range(from, from + pageSize - 1);

      if (error) throw error;
      if (!data || data.length === 0) break;
      rows.push(...(data as unknown as DbRow[]));
      if (data.length < pageSize) break;
    }

    return NextResponse.json({ ok: true, questions: rows.map(fromQuestionDb) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "문제 목록을 불러오지 못했습니다.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as
    | { draft?: QuestionDraft; drafts?: QuestionDraft[] }
    | null;
  if (!body) {
    return NextResponse.json({ ok: false, message: "잘못된 요청입니다." }, { status: 400 });
  }

  try {
    if (Array.isArray(body.drafts)) {
      if (body.drafts.length === 0) {
        return NextResponse.json({ ok: false, message: "등록할 문제가 없습니다." }, { status: 400 });
      }
      const questions = await appendQuestions(auth.supabase, body.drafts);
      return NextResponse.json({ ok: true, questions });
    }

    if (body.draft) {
      const question = await createQuestion(auth.supabase, body.draft);
      return NextResponse.json({ ok: true, question });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "문제 저장에 실패했습니다.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }

  return NextResponse.json({ ok: false, message: "문제 데이터가 필요합니다." }, { status: 400 });
}
