import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { embedTexts, EMBED_DIM } from "@/lib/ai/embed";

const BATCH = 40;

async function counts(supabase: import("@supabase/supabase-js").SupabaseClient) {
  const { count: total } = await supabase
    .from("questions")
    .select("id", { count: "exact", head: true });
  const { count: embedded } = await supabase
    .from("questions")
    .select("id", { count: "exact", head: true })
    .not("embedding", "is", null);
  const t = total ?? 0;
  const e = embedded ?? 0;
  return { total: t, embedded: e, remaining: Math.max(0, t - e) };
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  return NextResponse.json({ ok: true, ...(await counts(auth.supabase)) });
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ ok: false, message: "GEMINI_API_KEY 미설정" }, { status: 503 });
  }

  // 임베딩 없는 문제 BATCH개 가져오기
  const { data: rows, error } = await auth.supabase
    .from("questions")
    .select("id, subject, unit, concept, question")
    .is("embedding", null)
    .limit(BATCH);
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  if (!rows || rows.length === 0) {
    const c = await counts(auth.supabase);
    return NextResponse.json({ ok: true, processed: 0, done: true, ...c });
  }

  const texts = rows.map(
    (r) => `${(r.subject as string) ?? ""} ${(r.unit as string) ?? ""} ${(r.concept as string) ?? ""}\n${(r.question as string) ?? ""}`.trim()
  );

  let vectors: number[][];
  try {
    vectors = await embedTexts(texts, "RETRIEVAL_DOCUMENT");
  } catch (e) {
    const message = e instanceof Error ? e.message : "임베딩 생성 실패";
    return NextResponse.json({ ok: false, message: `임베딩 오류: ${message}` }, { status: 502 });
  }
  if (vectors.length !== rows.length || vectors.some((v) => v.length !== EMBED_DIM)) {
    return NextResponse.json(
      { ok: false, message: `임베딩 차원 불일치(기대 ${EMBED_DIM}). 모델 설정을 확인하세요.` },
      { status: 500 }
    );
  }

  // 각 문제에 임베딩 저장
  const results = await Promise.all(
    rows.map((r, i) => auth.supabase.from("questions").update({ embedding: vectors[i] }).eq("id", r.id))
  );
  const failed = results.find((res) => res.error);
  if (failed?.error) {
    return NextResponse.json({ ok: false, message: `저장 실패: ${failed.error.message}` }, { status: 500 });
  }

  const c = await counts(auth.supabase);
  return NextResponse.json({ ok: true, processed: rows.length, done: c.remaining === 0, ...c });
}
