import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import {
  COACHING_QUESTION_SELECT,
  questionRowsToRecords,
} from "@/lib/admin/coaching";
import { DIFFICULTY_KEYS, isKnownSubject, unitsForSubject } from "@/lib/taxonomy";
import type { Difficulty } from "@/types/exam";
import type { QuestionPool } from "@/types/question";

function shuffle<T>(values: T[]): T[] {
  const next = [...values];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as
    | {
        subject?: string;
        unit?: string;
        concept?: string;
        difficulty?: "all" | Difficulty;
        pool?: "all" | QuestionPool;
        count?: number;
        excludeIds?: unknown[];
      }
    | null;

  const subject = typeof body?.subject === "string" ? body.subject.trim() : "";
  const unit = typeof body?.unit === "string" ? body.unit.trim() : "";
  const concept = typeof body?.concept === "string" ? body.concept.trim() : "";
  const difficulty = body?.difficulty ?? "all";
  const pool = body?.pool ?? "all";
  const count = Math.max(1, Math.min(60, Math.round(Number(body?.count ?? 12))));
  const excludeIds = new Set(
    Array.isArray(body?.excludeIds)
      ? body.excludeIds.filter((id): id is string => typeof id === "string")
      : []
  );

  if (!isKnownSubject(subject)) {
    return NextResponse.json({ ok: false, message: "과목을 선택해 주세요." }, { status: 400 });
  }
  if (!unitsForSubject(subject).includes(unit)) {
    return NextResponse.json({ ok: false, message: "단원을 선택해 주세요." }, { status: 400 });
  }
  if (difficulty !== "all" && !DIFFICULTY_KEYS.includes(difficulty)) {
    return NextResponse.json({ ok: false, message: "난이도 값이 올바르지 않습니다." }, { status: 400 });
  }

  let query = auth.supabase
    .from("questions")
    .select(COACHING_QUESTION_SELECT)
    .eq("subject", subject)
    .eq("unit", unit)
    .limit(1000);

  if (concept) query = query.eq("concept", concept);
  if (difficulty !== "all") query = query.eq("difficulty", difficulty);
  if (pool !== "all") query = query.eq("pool", pool);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  const allQuestions = questionRowsToRecords((data ?? []) as unknown as Record<string, unknown>[]);
  const questions = shuffle(allQuestions.filter((question) => !excludeIds.has(question.id)));
  return NextResponse.json({
    ok: true,
    available: allQuestions.length,
    candidateCount: questions.length,
    questions: questions.slice(0, count),
    requestedCount: count,
  });
}
