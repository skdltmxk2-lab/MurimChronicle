import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import {
  COACHING_QUESTION_SELECT,
  questionRowsToRecords,
} from "@/lib/admin/coaching";
import { DIFFICULTY_KEYS, isKnownSubject, unitsForSubject } from "@/lib/taxonomy";
import type { Difficulty } from "@/types/exam";
import type { QuestionPool, QuestionRecord } from "@/types/question";

type UnitMockSection = {
  subject: string;
  unit: string;
  count: number;
};

type UnitMockBreakdown = {
  subject: string;
  unit: string;
  requestedCount: number;
  available: number;
  candidateCount: number;
  selectedCount: number;
};

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
        sections?: unknown[];
      }
    | null;

  const subject = typeof body?.subject === "string" ? body.subject.trim() : "";
  const unit = typeof body?.unit === "string" ? body.unit.trim() : "";
  const concept = typeof body?.concept === "string" ? body.concept.trim() : "";
  const difficulty = body?.difficulty ?? "all";
  const pool = body?.pool ?? "all";
  const excludeIds = new Set(
    Array.isArray(body?.excludeIds)
      ? body.excludeIds.filter((id): id is string => typeof id === "string")
      : []
  );

  if (difficulty !== "all" && !DIFFICULTY_KEYS.includes(difficulty)) {
    return NextResponse.json({ ok: false, message: "난이도 값이 올바르지 않습니다." }, { status: 400 });
  }

  const sectionInputs = Array.isArray(body?.sections) && body.sections.length > 0
    ? body.sections
    : [{ subject, unit, count: body?.count ?? 12 }];

  const sections: UnitMockSection[] = [];
  for (const rawSection of sectionInputs) {
    const item = rawSection as Record<string, unknown>;
    const sectionSubject = typeof item.subject === "string" ? item.subject.trim() : "";
    const sectionUnit = typeof item.unit === "string" ? item.unit.trim() : "";
    const rawCount = Number(item.count ?? 0);

    if (!isKnownSubject(sectionSubject)) {
      return NextResponse.json({ ok: false, message: "과목을 선택해 주세요." }, { status: 400 });
    }
    if (!unitsForSubject(sectionSubject).includes(sectionUnit)) {
      return NextResponse.json({ ok: false, message: "단원을 선택해 주세요." }, { status: 400 });
    }
    if (!Number.isFinite(rawCount)) {
      return NextResponse.json({ ok: false, message: "문항 수를 입력해 주세요." }, { status: 400 });
    }

    const sectionCount = Math.max(1, Math.min(60, Math.round(rawCount)));
    const existing = sections.find(
      (section) => section.subject === sectionSubject && section.unit === sectionUnit
    );
    if (existing) {
      existing.count += sectionCount;
    } else {
      sections.push({ subject: sectionSubject, unit: sectionUnit, count: sectionCount });
    }
  }

  const requestedCount = sections.reduce((sum, section) => sum + section.count, 0);
  if (requestedCount > 60) {
    return NextResponse.json(
      { ok: false, message: "복합 모고 총 문항 수는 60문항 이하로 설정해 주세요." },
      { status: 400 }
    );
  }

  const selectedIds = new Set(excludeIds);
  const selectedQuestions: QuestionRecord[] = [];
  const breakdown: UnitMockBreakdown[] = [];
  let available = 0;
  let candidateCount = 0;

  for (const section of sections) {
    let query = auth.supabase
      .from("questions")
      .select(COACHING_QUESTION_SELECT)
      .eq("subject", section.subject)
      .eq("unit", section.unit)
      .limit(1000);

    if (concept) query = query.eq("concept", concept);
    if (difficulty !== "all") query = query.eq("difficulty", difficulty);
    if (pool !== "all") query = query.eq("pool", pool);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    }

    const allQuestions = questionRowsToRecords((data ?? []) as unknown as Record<string, unknown>[]);
    const candidates = shuffle(allQuestions.filter((question) => !selectedIds.has(question.id)));
    const picked = candidates.slice(0, section.count);

    for (const question of picked) selectedIds.add(question.id);
    selectedQuestions.push(...picked);
    available += allQuestions.length;
    candidateCount += candidates.length;
    breakdown.push({
      subject: section.subject,
      unit: section.unit,
      requestedCount: section.count,
      available: allQuestions.length,
      candidateCount: candidates.length,
      selectedCount: picked.length,
    });
  }

  return NextResponse.json({
    ok: true,
    available,
    candidateCount,
    questions: selectedQuestions,
    requestedCount,
    breakdown,
  });
}
