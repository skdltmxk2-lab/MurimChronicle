import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";

/**
 * 붙여넣은 텍스트를 단어/뜻으로 파싱.
 * - 영문 단어 줄: 순수 알파벳(하이픈 허용) 한 토큰  (예: "inform", "by-product")
 * - 그 외 비어있지 않은 줄: 직전 단어의 뜻 (여러 줄이면 합침)
 */
function parseWords(text: string): { word: string; meaning: string }[] {
  const isWord = (line: string) => /^[A-Za-z][A-Za-z'-]*$/.test(line);
  const out: { word: string; meaning: string }[] = [];
  let cur: { word: string; meaning: string[] } | null = null;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    if (isWord(line)) {
      if (cur && cur.meaning.length > 0) out.push({ word: cur.word, meaning: cur.meaning.join(" / ") });
      cur = { word: line, meaning: [] };
    } else if (cur) {
      cur.meaning.push(line);
    }
  }
  if (cur && cur.meaning.length > 0) out.push({ word: cur.word, meaning: cur.meaning.join(" / ") });
  // 같은 단어 중복은 마지막 것으로
  const map = new Map<string, string>();
  for (const e of out) map.set(e.word, e.meaning);
  return Array.from(map, ([word, meaning]) => ({ word, meaning }));
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  const { count } = await auth.supabase.from("english_words").select("id", { count: "exact", head: true });
  return NextResponse.json({ ok: true, total: count ?? 0 });
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as { text?: string } | null;
  if (!body?.text || !body.text.trim()) {
    return NextResponse.json({ ok: false, message: "단어 목록 텍스트가 필요합니다." }, { status: 400 });
  }

  const parsed = parseWords(body.text);
  if (parsed.length === 0) {
    return NextResponse.json({ ok: false, message: "인식된 단어가 없습니다. 형식을 확인하세요." }, { status: 422 });
  }

  // 단어 기준 upsert (이미 있으면 뜻 갱신)
  const { error } = await auth.supabase
    .from("english_words")
    .upsert(parsed, { onConflict: "word" });
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

  const { count } = await auth.supabase.from("english_words").select("id", { count: "exact", head: true });
  return NextResponse.json({ ok: true, parsed: parsed.length, total: count ?? 0 });
}
