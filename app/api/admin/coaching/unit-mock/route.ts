import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import {
  COACHING_QUESTION_SELECT,
  questionRowsToRecords,
} from "@/lib/admin/coaching";
import {
  coachingStudentStoreMessage,
  findOwnedCoachingStudents,
  isCoachingStudentId,
  isMissingCoachingStudentStore,
} from "@/lib/admin/coachingStudents";
import {
  ALL_UNIT_VALUE,
  balancedUnitTargets,
  difficultyFallbackOrder,
  prioritizedUnitsForSubject,
  selectUnitMockCandidates,
} from "@/lib/admin/unitMockSelection";
import { DIFFICULTY_KEYS, isKnownSubject, unitsForSubject } from "@/lib/taxonomy";
import { isPublishableQuestion } from "@/lib/questions/standalone";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Difficulty } from "@/types/exam";
import type { QuestionPool, QuestionRecord } from "@/types/question";

const MAX_STUDENTS = 50;
const QUESTION_PAGE_SIZE = 1000;
const USAGE_QUESTION_CHUNK_SIZE = 200;
const QUESTION_POOLS: QuestionPool[] = ["general", "daily", "self_mock"];

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
  unusedAvailable: number;
  candidateCount: number;
  selectedCount: number;
  excludedIncomplete: number;
  selectedDifficultyCounts: Partial<Record<Difficulty, number>>;
  fallbackSelectedCount: number;
};

type CoachingUsage = {
  useCount: number;
  usedStudentCount: number;
  lastUsedAt: string | null;
};

type UsageLoadResult = {
  usageByQuestionId: Map<string, CoachingUsage>;
};

type QuestionLoadFilters = {
  subject: string;
  unit: string;
  concept: string;
  difficulty: "all" | Difficulty;
  pool: "all" | QuestionPool;
};

function shuffle<T>(values: T[]): T[] {
  const next = [...values];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function chunkValues<T>(values: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }
  return chunks;
}

function normalizeStudentIds(body: { studentId?: unknown; studentIds?: unknown[] } | null): string[] {
  const values = Array.isArray(body?.studentIds) ? body.studentIds : [body?.studentId];
  return Array.from(
    new Set(
      values
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean)
    )
  );
}

function incrementCount<T extends string>(
  counts: Partial<Record<T, number>>,
  key: T,
  amount = 1
) {
  counts[key] = (counts[key] ?? 0) + amount;
}

function countQuestionsByUnit(questions: QuestionRecord[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const question of questions) {
    counts[question.unit] = (counts[question.unit] ?? 0) + 1;
  }
  return counts;
}

function countDifficulties(questions: QuestionRecord[]): Partial<Record<Difficulty, number>> {
  const counts: Partial<Record<Difficulty, number>> = {};
  for (const question of questions) incrementCount(counts, question.difficulty);
  return counts;
}

async function loadQuestions(
  supabase: SupabaseClient,
  filters: QuestionLoadFilters
): Promise<{ questions: QuestionRecord[]; error: { message: string } | null }> {
  const rows: Record<string, unknown>[] = [];
  let offset = 0;

  while (true) {
    let query = supabase
      .from("questions")
      .select(COACHING_QUESTION_SELECT)
      .eq("subject", filters.subject)
      .eq("quality_status", "approved");

    if (filters.unit !== ALL_UNIT_VALUE) query = query.eq("unit", filters.unit);
    if (filters.concept) query = query.eq("concept", filters.concept);
    if (filters.difficulty !== "all") {
      query = query.in("difficulty", difficultyFallbackOrder(filters.difficulty));
    }
    if (filters.pool !== "all") query = query.eq("pool", filters.pool);

    const { data, error } = await query
      .order("id", { ascending: true })
      .range(offset, offset + QUESTION_PAGE_SIZE - 1);
    if (error) return { questions: [], error: { message: error.message } };

    const page = (data ?? []) as unknown as Record<string, unknown>[];
    rows.push(...page);
    if (page.length < QUESTION_PAGE_SIZE) break;
    offset += QUESTION_PAGE_SIZE;
  }

  return { questions: questionRowsToRecords(rows), error: null };
}

async function loadCoachingUsage(
  supabase: SupabaseClient,
  teacherId: string,
  studentIds: string[],
  questionIds: string[]
): Promise<UsageLoadResult> {
  const ids = Array.from(new Set(questionIds.filter(Boolean)));
  const usageByQuestionId = new Map<string, CoachingUsage>();
  if (ids.length === 0 || studentIds.length === 0) return { usageByQuestionId };

  for (const questionIdChunk of chunkValues(ids, USAGE_QUESTION_CHUNK_SIZE)) {
    let offset = 0;
    while (true) {
      const { data, error } = await supabase
        .from("coaching_student_question_usage")
        .select("student_id, question_id, use_count, last_used_at")
        .eq("teacher_id", teacherId)
        .in("student_id", studentIds)
        .in("question_id", questionIdChunk)
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

  return { usageByQuestionId };
}

function attachCoachingUsage(
  question: QuestionRecord,
  usage: Map<string, CoachingUsage>
): QuestionRecord {
  const item = usage.get(question.id);
  return {
    ...question,
    coachingUseCount: item?.useCount ?? 0,
    coachingUsedStudentCount: item?.usedStudentCount ?? 0,
    coachingLastUsedAt: item?.lastUsedAt ?? null,
  };
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
        studentId?: string;
        studentIds?: unknown[];
        excludeIds?: unknown[];
        excludeUsed?: boolean;
        sections?: unknown[];
      }
    | null;

  const subject = typeof body?.subject === "string" ? body.subject.trim() : "";
  const unit = typeof body?.unit === "string" ? body.unit.trim() : "";
  const concept = typeof body?.concept === "string" ? body.concept.trim() : "";
  const difficulty = body?.difficulty ?? "all";
  const pool = body?.pool ?? "all";
  const studentIds = normalizeStudentIds(body);
  const excludeUsed = body?.excludeUsed === true;
  const excludeIds = new Set(
    Array.isArray(body?.excludeIds)
      ? body.excludeIds.filter((id): id is string => typeof id === "string")
      : []
  );

  if (studentIds.length === 0) {
    return NextResponse.json({ ok: false, message: "출제 대상 학생을 선택해 주세요." }, { status: 400 });
  }
  if (studentIds.length > MAX_STUDENTS) {
    return NextResponse.json(
      { ok: false, message: `출제 대상 학생은 최대 ${MAX_STUDENTS}명까지 선택할 수 있습니다.` },
      { status: 400 }
    );
  }
  if (studentIds.some((studentId) => !isCoachingStudentId(studentId))) {
    return NextResponse.json({ ok: false, message: "학생 ID가 올바르지 않습니다." }, { status: 400 });
  }

  const ownedStudents = await findOwnedCoachingStudents(auth.supabase, auth.userId, studentIds);
  if (ownedStudents.error) {
    const message = isMissingCoachingStudentStore(ownedStudents.error)
      ? coachingStudentStoreMessage()
      : ownedStudents.error.message;
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
  if (ownedStudents.students.length !== studentIds.length) {
    return NextResponse.json(
      { ok: false, message: "선택한 학생 중 사용할 수 없는 학생이 있습니다. 학생 명단을 새로고침해 주세요." },
      { status: 404 }
    );
  }

  if (difficulty !== "all" && !DIFFICULTY_KEYS.includes(difficulty)) {
    return NextResponse.json({ ok: false, message: "난이도 값이 올바르지 않습니다." }, { status: 400 });
  }
  if (pool !== "all" && !QUESTION_POOLS.includes(pool)) {
    return NextResponse.json({ ok: false, message: "문제 풀 값이 올바르지 않습니다." }, { status: 400 });
  }

  const sectionInputs =
    Array.isArray(body?.sections) && body.sections.length > 0
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
    if (sectionUnit !== ALL_UNIT_VALUE && !unitsForSubject(sectionSubject).includes(sectionUnit)) {
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
  const selectedDifficultyCounts: Partial<Record<Difficulty, number>> = {};
  const breakdown: UnitMockBreakdown[] = [];
  let available = 0;
  let unusedAvailable = 0;
  let candidateCount = 0;
  let excludedIncomplete = 0;
  let fallbackSelectedCount = 0;

  for (const section of sections) {
    const loaded = await loadQuestions(auth.supabase, {
      subject: section.subject,
      unit: section.unit,
      concept,
      difficulty,
      pool,
    });
    if (loaded.error) {
      return NextResponse.json({ ok: false, message: loaded.error.message }, { status: 500 });
    }

    let usage: UsageLoadResult;
    try {
      usage = await loadCoachingUsage(
        auth.supabase,
        auth.userId,
        studentIds,
        loaded.questions.map((question) => question.id)
      );
    } catch (error) {
      const message =
        error && typeof error === "object" && isMissingCoachingStudentStore(error as { code?: string; message?: string })
          ? coachingStudentStoreMessage()
          : error instanceof Error
            ? error.message
            : "사용 이력을 불러오지 못했습니다.";
      return NextResponse.json({ ok: false, message }, { status: 500 });
    }

    const questionsWithUsage = loaded.questions.map((question) =>
      attachCoachingUsage(question, usage.usageByQuestionId)
    );
    const eligibleQuestions = questionsWithUsage.filter(isPublishableQuestion);
    const unusedQuestions = eligibleQuestions.filter(
      (question) => (question.coachingUsedStudentCount ?? 0) === 0
    );
    const candidates = shuffle(
      eligibleQuestions.filter(
        (question) =>
          !selectedIds.has(question.id) &&
          (!excludeUsed || (question.coachingUsedStudentCount ?? 0) === 0)
      )
    );
    const units = unitsForSubject(section.subject);
    const selection = selectUnitMockCandidates(candidates, {
      subject: section.subject,
      unit: section.unit,
      units,
      count: section.count,
      difficulty,
    });

    for (const question of selection.selected) {
      selectedIds.add(question.id);
      incrementCount(selectedDifficultyCounts, question.difficulty);
      if (difficulty !== "all" && question.difficulty !== difficulty) fallbackSelectedCount += 1;
    }
    selectedQuestions.push(...selection.selected);

    const sectionExcludedIncomplete = questionsWithUsage.length - eligibleQuestions.length;
    available += eligibleQuestions.length;
    unusedAvailable += unusedQuestions.length;
    candidateCount += candidates.length;
    excludedIncomplete += sectionExcludedIncomplete;

    const targets =
      section.unit === ALL_UNIT_VALUE
        ? balancedUnitTargets(section.subject, units, section.count)
        : { [section.unit]: section.count };
    const unitNames =
      section.unit === ALL_UNIT_VALUE
        ? prioritizedUnitsForSubject(section.subject, units)
        : [section.unit];
    const availableByUnit = countQuestionsByUnit(eligibleQuestions);
    const unusedByUnit = countQuestionsByUnit(unusedQuestions);
    const candidateByUnit = countQuestionsByUnit(candidates);
    const incompleteByUnit = countQuestionsByUnit(
      questionsWithUsage.filter((question) => !isPublishableQuestion(question))
    );

    for (const unitName of unitNames) {
      const unitSelected = selection.selected.filter((question) => question.unit === unitName);
      const requestedForUnit = targets[unitName] ?? 0;
      if (requestedForUnit === 0 && unitSelected.length === 0) continue;
      breakdown.push({
        subject: section.subject,
        unit: unitName,
        requestedCount: requestedForUnit,
        available: availableByUnit[unitName] ?? 0,
        unusedAvailable: unusedByUnit[unitName] ?? 0,
        candidateCount: candidateByUnit[unitName] ?? 0,
        selectedCount: unitSelected.length,
        excludedIncomplete: incompleteByUnit[unitName] ?? 0,
        selectedDifficultyCounts: countDifficulties(unitSelected),
        fallbackSelectedCount:
          difficulty === "all"
            ? 0
            : unitSelected.filter((question) => question.difficulty !== difficulty).length,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    available,
    unusedAvailable,
    candidateCount,
    questions: selectedQuestions,
    requestedCount,
    breakdown,
    excludedIncomplete,
    selectedDifficultyCounts,
    fallbackSelectedCount,
    difficultyOrder: difficultyFallbackOrder(difficulty),
    usageTrackingAvailable: true,
    students: ownedStudents.students,
    student: ownedStudents.students[0],
  });
}
