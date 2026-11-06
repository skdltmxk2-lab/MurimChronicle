import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { COACHING_QUESTION_SELECT, questionRowsToRecords } from "@/lib/admin/coaching";
import {
  coachingStudentStoreMessage,
  findOwnedCoachingStudents,
  isCoachingStudentId,
  isMissingCoachingStudentStore,
} from "@/lib/admin/coachingStudents";
import { ALL_UNIT_VALUE } from "@/lib/admin/unitMockSelection";
import {
  browsePreviewText,
  clampBrowseLimit,
  clampBrowseOffset,
  compareBrowseRows,
  countBrowseRowsByUnit,
  matchesBrowseQuery,
  normalizeBrowseQuery,
} from "@/lib/admin/unitMockBrowseCore.mjs";
import { DIFFICULTY_KEYS, isKnownSubject, unitsForSubject } from "@/lib/taxonomy";
import { getStandaloneQuestionIssue, isPublishableQuestion } from "@/lib/questions/standalone";
import { createQualityGateSession } from "@/lib/questions/qualityGateServer";
import type { Difficulty } from "@/types/exam";
import type { QuestionPool, QuestionQualityStatus, QuestionRecord } from "@/types/question";

/**
 * 단원별 모고에서 [이 문제 교체] 가 후보를 못 찾았을 때 쓰는 "다른 파트에서 가져오기".
 * 과목·단원·난이도·검색어로 문제은행을 직접 훑어 한 문제를 골라 오게 한다.
 *
 *  - action "list"    : 가벼운 목록(그림·선지·해설 없이 본문 일부만)을 쪽 단위로 돌려준다.
 *  - action "preview" : 한 문제의 전체 내용(그림·선지 포함)을 돌려준다. 게이트는 돌리지 않는다.
 *  - action "pick"    : 실제로 문제지에 넣을 문제. 출제와 같은 품질 게이트를 한 번 거친다.
 *
 * 교체 후보 로직(unit-mock/route.ts)과 따로 둔 이유: 거기는 "조건에 맞는 문제를 알아서 뽑는" 경로이고,
 * 여기는 사람이 고르는 경로라 이미 문제지에 있거나 이번에 뺀 문제(excludeIds)만 빼고 막지 않는다.
 */

const MAX_STUDENTS = 50;
const QUESTION_PAGE_SIZE = 1000;
const USAGE_QUESTION_CHUNK_SIZE = 200;
const QUESTION_POOLS: QuestionPool[] = ["general", "daily", "self_mock"];
const MAX_EXCLUDE_IDS = 2000;

// 목록에는 그림·선지·해설 그림이 필요 없다. isPublishableQuestion 이 보는 필드(explanation 포함)만 가져온다.
const BROWSE_SELECT = [
  "id",
  "subject",
  "unit",
  "concept",
  "difficulty",
  "pool",
  "question",
  "content_type",
  "question_type",
  "explanation",
  "tags",
  "quality_status",
].join(", ");

type BrowseRow = {
  id: string;
  subject: string;
  unit: string;
  concept: string;
  difficulty: Difficulty;
  pool: QuestionPool;
  question: string;
  contentType: string | null;
  questionType: string | null;
  explanation: string;
  tags: string[];
  qualityStatus: QuestionQualityStatus;
};

type CoachingUsage = {
  useCount: number;
  usedStudentCount: number;
  lastUsedAt: string | null;
};

type BrowseAction = "list" | "preview" | "pick";

function fail(message: string, status: number) {
  return NextResponse.json({ ok: false, message }, { status });
}

function chunkValues<T>(values: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }
  return chunks;
}

function stringList(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(value.filter((item): item is string => typeof item === "string" && item.length > 0))
  ).slice(0, max);
}

function rowFromDb(row: Record<string, unknown>): BrowseRow {
  return {
    id: String(row.id),
    subject: String(row.subject ?? ""),
    unit: String(row.unit ?? ""),
    concept: String(row.concept ?? ""),
    difficulty: row.difficulty as Difficulty,
    pool: ((row.pool as QuestionPool | null) ?? "general") as QuestionPool,
    question: String(row.question ?? ""),
    contentType: (row.content_type as string | null) ?? null,
    questionType: (row.question_type as string | null) ?? null,
    explanation: String(row.explanation ?? ""),
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    qualityStatus: ((row.quality_status as QuestionQualityStatus | null) ?? "approved") as QuestionQualityStatus,
  };
}

async function loadSubjectRows(
  supabase: SupabaseClient,
  subject: string,
  pool: "all" | QuestionPool
): Promise<{ rows: BrowseRow[]; error: { message: string } | null }> {
  const rows: BrowseRow[] = [];
  let offset = 0;
  while (true) {
    let query = supabase
      .from("questions")
      .select(BROWSE_SELECT)
      .eq("subject", subject)
      .eq("quality_status", "approved");
    if (pool !== "all") query = query.eq("pool", pool);

    const { data, error } = await query
      .order("id", { ascending: true })
      .range(offset, offset + QUESTION_PAGE_SIZE - 1);
    if (error) return { rows: [], error: { message: error.message } };

    const page = (data ?? []) as unknown as Record<string, unknown>[];
    rows.push(...page.map(rowFromDb));
    if (page.length < QUESTION_PAGE_SIZE) break;
    offset += QUESTION_PAGE_SIZE;
  }
  return { rows, error: null };
}

async function loadCoachingUsage(
  supabase: SupabaseClient,
  teacherId: string,
  studentIds: string[],
  questionIds: string[]
): Promise<Map<string, CoachingUsage>> {
  const usageByQuestionId = new Map<string, CoachingUsage>();
  const ids = Array.from(new Set(questionIds.filter(Boolean)));
  if (ids.length === 0 || studentIds.length === 0) return usageByQuestionId;

  for (const idChunk of chunkValues(ids, USAGE_QUESTION_CHUNK_SIZE)) {
    let offset = 0;
    while (true) {
      const { data, error } = await supabase
        .from("coaching_student_question_usage")
        .select("student_id, question_id, use_count, last_used_at")
        .eq("teacher_id", teacherId)
        .in("student_id", studentIds)
        .in("question_id", idChunk)
        .order("question_id", { ascending: true })
        .order("student_id", { ascending: true })
        .range(offset, offset + QUESTION_PAGE_SIZE - 1);
      if (error) throw error;

      const page = data ?? [];
      for (const row of page) {
        const questionId = row.question_id as string;
        const current = usageByQuestionId.get(questionId) ?? {
          useCount: 0,
          usedStudentCount: 0,
          lastUsedAt: null,
        };
        const lastUsedAt = (row.last_used_at as string | null) ?? null;
        usageByQuestionId.set(questionId, {
          useCount: current.useCount + Number(row.use_count ?? 0),
          usedStudentCount: current.usedStudentCount + 1,
          lastUsedAt:
            lastUsedAt && (!current.lastUsedAt || lastUsedAt > current.lastUsedAt)
              ? lastUsedAt
              : current.lastUsedAt,
        });
      }
      if (page.length < QUESTION_PAGE_SIZE) break;
      offset += QUESTION_PAGE_SIZE;
    }
  }
  return usageByQuestionId;
}

function usageErrorResponse(error: unknown) {
  const message =
    error && typeof error === "object" && isMissingCoachingStudentStore(error as { code?: string; message?: string })
      ? coachingStudentStoreMessage()
      : error instanceof Error
        ? error.message
        : "사용 이력을 불러오지 못했습니다.";
  return fail(message, 500);
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return fail("요청 형식이 올바르지 않습니다.", 400);

  const action: BrowseAction =
    body.action === "preview" || body.action === "pick" ? body.action : "list";
  const forHomework = body.forHomework === true;
  const studentIds = stringList(body.studentIds, MAX_STUDENTS + 1).map((id) => id.trim());

  if (!forHomework && studentIds.length === 0) return fail("출제 대상 학생을 선택해 주세요.", 400);
  if (studentIds.length > MAX_STUDENTS) {
    return fail(`출제 대상 학생은 최대 ${MAX_STUDENTS}명까지 선택할 수 있습니다.`, 400);
  }
  if (studentIds.some((studentId) => !isCoachingStudentId(studentId))) {
    return fail("학생 ID가 올바르지 않습니다.", 400);
  }
  if (studentIds.length > 0) {
    const owned = await findOwnedCoachingStudents(auth.supabase, auth.userId, studentIds);
    if (owned.error) {
      return fail(
        isMissingCoachingStudentStore(owned.error) ? coachingStudentStoreMessage() : owned.error.message,
        500
      );
    }
    if (owned.students.length !== studentIds.length) {
      return fail("선택한 학생 중 사용할 수 없는 학생이 있습니다. 학생 명단을 새로고침해 주세요.", 404);
    }
  }

  if (action !== "list") {
    const questionId = typeof body.questionId === "string" ? body.questionId.trim() : "";
    if (!questionId) return fail("가져올 문제를 지정해 주세요.", 400);

    const { data, error } = await auth.supabase
      .from("questions")
      .select(COACHING_QUESTION_SELECT)
      .eq("id", questionId)
      .eq("quality_status", "approved")
      .maybeSingle();
    if (error) return fail(error.message, 500);
    if (!data) return fail("문제를 찾을 수 없거나 지금은 쓸 수 없는 상태입니다.", 404);

    const [record] = questionRowsToRecords([data as unknown as Record<string, unknown>]);
    const issue = getStandaloneQuestionIssue(record);
    if (issue || !isPublishableQuestion(record)) {
      return fail(issue?.message ?? "단독 출제할 수 없는 문제입니다.", 422);
    }

    let usage: Map<string, CoachingUsage>;
    try {
      usage = await loadCoachingUsage(auth.supabase, auth.userId, studentIds, [record.id]);
    } catch (usageError) {
      return usageErrorResponse(usageError);
    }
    const used = usage.get(record.id);
    const withUsage: QuestionRecord = {
      ...record,
      coachingUseCount: used?.useCount ?? 0,
      coachingUsedStudentCount: used?.usedStudentCount ?? 0,
      coachingLastUsedAt: used?.lastUsedAt ?? null,
    };

    if (action === "preview") return NextResponse.json({ ok: true, question: withUsage });

    // 실제로 문제지에 넣는 문제만 출제와 같은 품질 게이트를 거친다.
    const gate = await createQualityGateSession({
      supabase: auth.supabase,
      actorId: auth.userId,
      context: "unit-mock",
      origin: new URL(request.url).origin,
    });
    const selected = await gate.select({
      candidates: [withUsage],
      count: 1,
      select: (pool, count) => pool.slice(0, count),
    });
    if (selected.length === 0) {
      return fail("품질 검사에서 제외된 문제라 가져올 수 없습니다. 다른 문제를 선택해 주세요.", 422);
    }
    return NextResponse.json({ ok: true, question: selected[0], qualityGate: gate.response() });
  }

  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const unit = typeof body.unit === "string" ? body.unit.trim() : ALL_UNIT_VALUE;
  const difficulty = (typeof body.difficulty === "string" ? body.difficulty : "all") as "all" | Difficulty;
  const pool = (typeof body.pool === "string" ? body.pool : "all") as "all" | QuestionPool;
  const query = normalizeBrowseQuery(body.query);
  const onlyUnused = !forHomework && body.onlyUnused === true;
  const excludeIds = new Set(stringList(body.excludeIds, MAX_EXCLUDE_IDS));
  const limit = clampBrowseLimit(body.limit);
  const offset = clampBrowseOffset(body.offset);

  if (!isKnownSubject(subject)) return fail("과목을 선택해 주세요.", 400);
  if (unit !== ALL_UNIT_VALUE && !unitsForSubject(subject).includes(unit)) {
    return fail("단원을 선택해 주세요.", 400);
  }
  if (difficulty !== "all" && !DIFFICULTY_KEYS.includes(difficulty)) {
    return fail("난이도 값이 올바르지 않습니다.", 400);
  }
  if (pool !== "all" && !QUESTION_POOLS.includes(pool)) {
    return fail("문제 풀 값이 올바르지 않습니다.", 400);
  }

  const loaded = await loadSubjectRows(auth.supabase, subject, pool);
  if (loaded.error) return fail(loaded.error.message, 500);

  // 단원 필터 전까지의 조건으로 거른다. 단원별 개수(unitCounts)가 같은 조건을 반영해야 하기 때문이다.
  const base = loaded.rows.filter(
    (row) =>
      !excludeIds.has(row.id) &&
      (difficulty === "all" || row.difficulty === difficulty) &&
      matchesBrowseQuery(row, query) &&
      isPublishableQuestion({
        concept: row.concept,
        question: row.question,
        explanation: row.explanation,
        tags: row.tags,
        qualityStatus: row.qualityStatus,
      })
  );

  let usage = new Map<string, CoachingUsage>();
  let scoped = base;
  try {
    if (onlyUnused) {
      usage = await loadCoachingUsage(auth.supabase, auth.userId, studentIds, base.map((row) => row.id));
      scoped = base.filter((row) => (usage.get(row.id)?.usedStudentCount ?? 0) === 0);
    }
    const inUnit = unit === ALL_UNIT_VALUE ? scoped : scoped.filter((row) => row.unit === unit);
    const sorted = [...inUnit].sort(compareBrowseRows(unitsForSubject(subject)));
    const page = sorted.slice(offset, offset + limit);
    if (!onlyUnused) {
      usage = await loadCoachingUsage(auth.supabase, auth.userId, studentIds, page.map((row) => row.id));
    }

    return NextResponse.json({
      ok: true,
      total: sorted.length,
      offset,
      hasMore: offset + page.length < sorted.length,
      unitCounts: countBrowseRowsByUnit(scoped),
      items: page.map((row) => ({
        id: row.id,
        subject: row.subject,
        unit: row.unit,
        concept: row.concept,
        difficulty: row.difficulty,
        pool: row.pool,
        question: browsePreviewText(row.question),
        hasImage: row.contentType === "image" || row.contentType === "mixed",
        isSubjective: row.questionType === "subjective",
        coachingUseCount: usage.get(row.id)?.useCount ?? 0,
        coachingUsedStudentCount: usage.get(row.id)?.usedStudentCount ?? 0,
        coachingLastUsedAt: usage.get(row.id)?.lastUsedAt ?? null,
      })),
    });
  } catch (usageError) {
    return usageErrorResponse(usageError);
  }
}
