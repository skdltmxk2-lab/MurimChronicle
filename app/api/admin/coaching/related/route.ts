import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { embedOne, EMBED_DIM } from "@/lib/ai/embed";
import { friendlyAiError } from "@/lib/ai/gemini";
import {
  COACHING_QUESTION_SELECT,
  questionRowsToRecords,
} from "@/lib/admin/coaching";
import { isKnownSubject } from "@/lib/taxonomy";
import type { CoachingExtractedProblem, CoachingRelatedGroup } from "@/types/coaching";
import type { QuestionRecord } from "@/types/question";

type MatchRow = {
  id: string;
  similarity?: number;
};

function problemSearchText(problem: CoachingExtractedProblem): string {
  return [
    problem.subject,
    problem.unit,
    problem.concept,
    problem.problemText,
    ...problem.options.map((option) => `${option.label} ${option.text}`),
    problem.figureDescription,
    problem.keywords.join(" "),
  ]
    .filter(Boolean)
    .join("\n");
}

async function fetchQuestionsByIds(
  supabase: SupabaseClient,
  ids: string[]
): Promise<Map<string, QuestionRecord>> {
  if (ids.length === 0) return new Map();
  const { data, error } = await supabase
    .from("questions")
    .select(COACHING_QUESTION_SELECT)
    .in("id", ids);
  if (error) throw error;
  const records = questionRowsToRecords((data ?? []) as unknown as Record<string, unknown>[]);
  return new Map(records.map((record) => [record.id, record]));
}

async function matchProblem(
  supabase: SupabaseClient,
  problem: CoachingExtractedProblem,
  perProblem: number,
  usedIds: Set<string>
) {
  const vec = await embedOne(problemSearchText(problem), "RETRIEVAL_QUERY");
  if (vec.length !== EMBED_DIM) return [];

  const { data, error } = await supabase.rpc("match_questions", {
    query_embedding: vec,
    match_count: Math.max(perProblem * 8, perProblem + usedIds.size + 12),
    p_subject: isKnownSubject(problem.subject) ? problem.subject : null,
  });
  if (error) throw error;

  const rows = ((data ?? []) as MatchRow[]).filter((row) => row.id && !usedIds.has(row.id));
  const ids = rows.map((row) => row.id);
  const byId = await fetchQuestionsByIds(supabase, ids);
  const matches: Array<{ question: QuestionRecord; similarity?: number }> = [];
  for (const row of rows) {
    const question = byId.get(row.id);
    if (!question) continue;
    matches.push(
      typeof row.similarity === "number"
        ? { question, similarity: row.similarity }
        : { question }
    );
  }
  return matches;
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { ok: false, message: "임베딩 API 키가 설정되지 않았습니다. GEMINI_API_KEY를 확인해 주세요." },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => null)) as
    | { problems?: CoachingExtractedProblem[]; perProblem?: number; excludeIds?: unknown[] }
    | null;
  const problems = Array.isArray(body?.problems) ? body.problems : [];
  const perProblem = Math.max(1, Math.min(6, Math.round(Number(body?.perProblem ?? 2))));
  const excludeIds = Array.isArray(body?.excludeIds)
    ? body.excludeIds.filter((id): id is string => typeof id === "string").slice(0, 100)
    : [];

  if (problems.length === 0) {
    return NextResponse.json({ ok: false, message: "관련문제를 찾을 원문 문제가 없습니다." }, { status: 400 });
  }
  if (problems.length > 30) {
    return NextResponse.json({ ok: false, message: "한 번에 최대 30문제까지만 처리할 수 있습니다." }, { status: 400 });
  }

  try {
    const usedIds = new Set<string>(excludeIds);
    const groups: CoachingRelatedGroup[] = [];

    for (const problem of problems) {
      const matches = await matchProblem(auth.supabase, problem, perProblem, usedIds);
      if (matches.length < perProblem) {
        groups.push({
          source: problem,
          matches: [],
          skipped: true,
          reason: `관련문제 ${perProblem}개를 채우지 못했습니다.`,
        });
        continue;
      }

      const selected = matches.slice(0, perProblem);
      selected.forEach((match) => usedIds.add(match.question.id));
      groups.push({ source: problem, matches: selected });
    }

    return NextResponse.json({
      ok: true,
      perProblem,
      groups,
      selectedCount: groups.reduce((sum, group) => sum + group.matches.length, 0),
      skippedCount: groups.filter((group) => group.skipped).length,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, message: friendlyAiError(error) }, { status: 500 });
  }
}
