import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { isStandaloneQuestion } from "@/lib/questions/standalone";

function todayDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * 라운드 로빈으로 데일리 5문항 자동 생성:
 *   1. 후보 풀: questions 테이블에서 daily 태그 + (선택) 과목/단원 필터
 *   2. daily_usage와 left join: use_count 오름차순 → last_used_date 오름차순
 *   3. 한 번도 안 쓴 문제 우선, 그 다음 가장 오래 전에 쓴 문제 순
 *   4. 상위 N개 추출 → daily_assignments에 저장 + daily_usage 업데이트
 */
export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => ({}))) as {
    date?: string;
    count?: number;
    subject?: string;
    units?: string[];
  };

  const date = body.date || todayDate();
  const count = Math.min(20, Math.max(1, body.count ?? 5));

  const supabase = auth.supabase;

  // 1. 데일리 풀 (subject/units 필터링)
  let query = supabase
    .from("questions")
    .select("id, subject, unit, concept, question, explanation, tags")
    .contains("tags", ["daily"])
    .eq("quality_status", "approved");
  if (body.subject) query = query.eq("subject", body.subject);
  const { data: poolRows, error: poolError } = await query;
  if (poolError) {
    return NextResponse.json({ ok: false, message: poolError.message }, { status: 500 });
  }

  let pool = ((poolRows ?? []) as Array<{
    id: string;
    subject: string;
    unit: string;
    concept: string;
    question: string;
    explanation: string;
    tags: string[];
  }>).filter(isStandaloneQuestion);
  if (body.units && body.units.length > 0) {
    const unitSet = new Set(body.units);
    pool = pool.filter((q) => unitSet.has(q.unit));
  }

  if (pool.length === 0) {
    return NextResponse.json(
      { ok: false, message: "조건에 맞는 데일리 풀이 비어있습니다." },
      { status: 400 }
    );
  }

  // 2. 사용 이력 가져오기
  const ids = pool.map((q) => q.id);
  const { data: usageRows } = await supabase
    .from("daily_usage")
    .select("question_id, last_used_date, use_count")
    .in("question_id", ids);

  const usageMap = new Map<string, { lastUsedDate: string; useCount: number }>();
  for (const row of usageRows ?? []) {
    usageMap.set(row.question_id as string, {
      lastUsedDate: row.last_used_date as string,
      useCount: (row.use_count as number) ?? 0,
    });
  }

  // 3. 정렬: 사용 횟수 적은 순 → 가장 오래 전에 쓴 순 → 안정 정렬을 위해 ID
  const sorted = [...pool].sort((a, b) => {
    const ua = usageMap.get(a.id);
    const ub = usageMap.get(b.id);
    const ca = ua?.useCount ?? 0;
    const cb = ub?.useCount ?? 0;
    if (ca !== cb) return ca - cb;
    const da = ua?.lastUsedDate ?? "0000-00-00";
    const db = ub?.lastUsedDate ?? "0000-00-00";
    if (da !== db) return da < db ? -1 : 1;
    return a.id.localeCompare(b.id);
  });

  // 4. 같은 useCount 내에서는 살짝 셔플 (매번 같은 순서로 나오지 않게)
  // 사용 횟수 그룹별로 분리 후 그룹 내 셔플
  const groups = new Map<number, typeof sorted>();
  for (const q of sorted) {
    const c = usageMap.get(q.id)?.useCount ?? 0;
    if (!groups.has(c)) groups.set(c, []);
    groups.get(c)!.push(q);
  }
  const shuffled: typeof sorted = [];
  const groupKeys = [...groups.keys()].sort((a, b) => a - b);
  for (const k of groupKeys) {
    const arr = groups.get(k)!;
    // Fisher-Yates 셔플
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    shuffled.push(...arr);
  }

  const picked = shuffled.slice(0, count);
  const pickedIds = picked.map((q) => q.id);

  // 5. assignment 저장 + usage 업데이트
  const { error: assignError } = await supabase
    .from("daily_assignments")
    .upsert({ date, question_ids: pickedIds, updated_at: new Date().toISOString() });
  if (assignError) {
    return NextResponse.json({ ok: false, message: assignError.message }, { status: 500 });
  }

  const usageUpdates = pickedIds.map((qid) => ({
    question_id: qid,
    last_used_date: date,
    use_count: (usageMap.get(qid)?.useCount ?? 0) + 1,
    updated_at: new Date().toISOString(),
  }));
  await supabase.from("daily_usage").upsert(usageUpdates);

  return NextResponse.json({
    ok: true,
    date,
    questionIds: pickedIds,
    cycleStats: {
      poolSize: pool.length,
      unusedCount: pool.filter((q) => !usageMap.has(q.id)).length,
      minUseCount: groupKeys[0] ?? 0,
    },
  });
}
