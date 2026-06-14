import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { extractJson, friendlyAiError, generateWithRetry, GEMINI_MODEL } from "@/lib/ai/gemini";
import {
  COACHING_QUESTION_SELECT,
  questionRowsToRecords,
  questionSearchText,
} from "@/lib/admin/coaching";
import {
  DIFFICULTY_KEYS,
  DIFFICULTY_LABELS,
  SUBJECT_NAMES,
  SUBJECT_UNITS,
  isKnownSubject,
  unitsForSubject,
} from "@/lib/taxonomy";
import type { Difficulty } from "@/types/exam";
import type {
  CoachingClassificationValue,
  CoachingReclassificationItem,
} from "@/types/coaching";
import type { QuestionRecord } from "@/types/question";

const MAX_LIMIT = 500;
const AI_BATCH = 25;

type RawClassification = Partial<{
  id: string;
  subject: string;
  unit: string;
  concept: string;
  difficulty: Difficulty | string;
  confidence: number;
  reason: string;
}>;

function clamp01(value: unknown): number {
  return typeof value === "number" ? Math.max(0, Math.min(1, value)) : 0.5;
}

function normalizeDifficulty(value: unknown, fallback: Difficulty): Difficulty {
  return typeof value === "string" && (DIFFICULTY_KEYS as string[]).includes(value)
    ? (value as Difficulty)
    : fallback;
}

function classificationOf(question: QuestionRecord): CoachingClassificationValue {
  return {
    subject: question.subject,
    unit: question.unit,
    concept: question.concept,
    difficulty: question.difficulty,
  };
}

function changed(before: CoachingClassificationValue, after: CoachingClassificationValue): boolean {
  return (
    before.subject !== after.subject ||
    before.unit !== after.unit ||
    before.concept !== after.concept ||
    before.difficulty !== after.difficulty
  );
}

function questionPreview(question: QuestionRecord): string {
  return question.question.replace(/\s+/g, " ").slice(0, 180);
}

function buildPrompt(questions: QuestionRecord[]) {
  const unitList = SUBJECT_NAMES.map((subject) => `- ${subject}: ${SUBJECT_UNITS[subject].join(", ")}`).join("\n");
  const difficultyList = DIFFICULTY_KEYS.map((key) => `${key}(${DIFFICULTY_LABELS[key]})`).join(", ");
  const payload = questions.map((question) => ({
    id: question.id,
    current: classificationOf(question),
    text: questionSearchText(question).slice(0, 2200),
  }));

  return [
    "너는 편입수학 DB를 정리하는 분류 검수자다.",
    "각 문제의 본문, 보기, 풀이를 보고 과목/단원/세부개념/난이도를 다시 판정한다.",
    "설명/코드펜스 없이 JSON 객체 하나만 출력한다.",
    "",
    "반드시 아래 JSON 형식으로 답한다:",
    '{"items":[{"id":"...","subject":"미분학","unit":"최대/최소","concept":"폐구간 최대최소","difficulty":"medium","confidence":0.92,"reason":"..."}]}',
    "",
    "규칙:",
    `- subject는 다음 중 하나만 사용: ${SUBJECT_NAMES.join(", ")}`,
    "- unit은 아래 과목별 단원 목록 중 하나만 사용한다.",
    "- concept는 실제 문제 유형을 2~18자 한국어 세부개념으로 쓴다. 너무 넓은 '함수', '미분' 같은 단어만 쓰지 않는다.",
    `- difficulty는 다음 키 중 하나만 사용: ${difficultyList}`,
    "- 확신이 낮아도 가장 가까운 과목/단원을 고르고 confidence를 낮게 둔다.",
    "- 기존 분류가 맞으면 그대로 반환해도 된다.",
    "",
    "과목별 단원:",
    unitList,
    "",
    "문제 목록 JSON:",
    JSON.stringify(payload),
  ].join("\n");
}

function normalizeResult(raw: RawClassification, original: QuestionRecord): CoachingReclassificationItem {
  const fallback = classificationOf(original);
  const rawSubject = typeof raw.subject === "string" ? raw.subject.trim() : "";
  const subject = isKnownSubject(rawSubject) ? rawSubject : original.subject;
  const rawUnit = typeof raw.unit === "string" ? raw.unit.trim() : "";
  const unit = unitsForSubject(subject).includes(rawUnit) ? rawUnit : original.unit;
  const concept =
    typeof raw.concept === "string" && raw.concept.trim()
      ? raw.concept.trim().slice(0, 40)
      : original.concept;
  const difficulty = normalizeDifficulty(raw.difficulty, original.difficulty);
  const after: CoachingClassificationValue = { subject, unit, concept, difficulty };

  return {
    id: original.id,
    questionPreview: questionPreview(original),
    before: fallback,
    after,
    confidence: clamp01(raw.confidence),
    reason: typeof raw.reason === "string" ? raw.reason.trim().slice(0, 200) : "",
    changed: changed(fallback, after),
  };
}

async function classifyBatch(questions: QuestionRecord[]) {
  const result = await generateWithRetry({
    model: GEMINI_MODEL,
    contents: [{ role: "user", parts: [{ text: buildPrompt(questions) }] }],
    config: { responseMimeType: "application/json", maxOutputTokens: 16384 },
  });
  const parsed = extractJson<{ items?: RawClassification[] }>(result.text ?? "");
  const byId = new Map((parsed?.items ?? []).map((item) => [String(item.id ?? ""), item]));
  return questions.map((question) => normalizeResult(byId.get(question.id) ?? {}, question));
}

function normalizeReviewedItem(raw: unknown): CoachingReclassificationItem | null {
  const item = raw as Partial<CoachingReclassificationItem> | null;
  if (!item || typeof item.id !== "string" || !item.after) return null;
  const subject = typeof item.after.subject === "string" ? item.after.subject.trim() : "";
  if (!isKnownSubject(subject)) return null;
  const unit = typeof item.after.unit === "string" ? item.after.unit.trim() : "";
  if (!unitsForSubject(subject).includes(unit)) return null;
  const concept = typeof item.after.concept === "string" ? item.after.concept.trim().slice(0, 40) : "";
  if (!concept) return null;
  const difficulty = normalizeDifficulty(item.after.difficulty, "medium");
  return {
    id: item.id,
    questionPreview: typeof item.questionPreview === "string" ? item.questionPreview : "",
    before: item.before ?? { subject: "", unit: "", concept: "", difficulty: "" },
    after: { subject, unit, concept, difficulty },
    confidence: clamp01(item.confidence),
    reason: typeof item.reason === "string" ? item.reason : "",
    changed: true,
  };
}

async function applyItems(
  supabase: SupabaseClient,
  items: CoachingReclassificationItem[]
) {
  let applied = 0;
  for (const item of items) {
    const { error } = await supabase
      .from("questions")
      .update({
        subject: item.after.subject,
        unit: item.after.unit,
        concept: item.after.concept,
        difficulty: item.after.difficulty,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id);
    if (error) throw error;
    applied += 1;
  }
  return applied;
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  const { count, error } = await auth.supabase
    .from("questions")
    .select("id", { count: "exact", head: true });
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, total: count ?? 0 });
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as
    | {
        offset?: number;
        limit?: number;
        applyReviewed?: boolean;
        items?: unknown[];
      }
    | null;

  if (body?.applyReviewed) {
    const items = (Array.isArray(body.items) ? body.items : [])
      .map(normalizeReviewedItem)
      .filter((item): item is CoachingReclassificationItem => Boolean(item))
      .filter((item) => item.changed);
    if (items.length === 0) {
      return NextResponse.json({ ok: false, message: "반영할 분류 결과가 없습니다." }, { status: 400 });
    }
    try {
      const applied = await applyItems(auth.supabase, items);
      return NextResponse.json({ ok: true, applied });
    } catch (error) {
      return NextResponse.json(
        { ok: false, message: error instanceof Error ? error.message : "DB 반영에 실패했습니다." },
        { status: 500 }
      );
    }
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { ok: false, message: "AI API 키가 설정되지 않았습니다. GEMINI_API_KEY를 확인해 주세요." },
      { status: 503 }
    );
  }

  const offset = Math.max(0, Math.round(Number(body?.offset ?? 0)));
  const limit = Math.max(1, Math.min(MAX_LIMIT, Math.round(Number(body?.limit ?? MAX_LIMIT))));

  const { data, error, count } = await auth.supabase
    .from("questions")
    .select(COACHING_QUESTION_SELECT, { count: "exact" })
    .order("created_at", { ascending: true })
    .range(offset, offset + limit - 1);
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

  const questions = questionRowsToRecords((data ?? []) as unknown as Record<string, unknown>[]);
  if (questions.length === 0) {
    return NextResponse.json({ ok: true, total: count ?? 0, offset, limit, items: [], changedCount: 0 });
  }

  try {
    const items: CoachingReclassificationItem[] = [];
    for (let i = 0; i < questions.length; i += AI_BATCH) {
      items.push(...(await classifyBatch(questions.slice(i, i + AI_BATCH))));
    }
    return NextResponse.json({
      ok: true,
      total: count ?? 0,
      offset,
      limit,
      reviewed: items.length,
      changedCount: items.filter((item) => item.changed).length,
      items,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, message: friendlyAiError(error) }, { status: 502 });
  }
}
