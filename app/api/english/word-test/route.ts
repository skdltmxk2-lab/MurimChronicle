import { NextResponse } from "next/server";
import { requireTier } from "@/lib/auth/requireTier";

type WordRow = { id: number; word: string; meaning: string };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function GET(request: Request) {
  const auth = await requireTier(request, "free");
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const count = Math.min(20, Math.max(5, Number(url.searchParams.get("count")) || 10));

  // 정답 + 오답 후보를 넉넉히 무작위 추출
  const { data, error } = await auth.supabase.rpc("random_english_words", { p_count: count * 4 });
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  const pool = (data ?? []) as WordRow[];
  if (pool.length < 4) {
    return NextResponse.json({ ok: true, questions: [], message: "등록된 단어가 부족해요. 관리자에서 단어를 추가해 주세요." });
  }

  const questions = pool.slice(0, count).map((q) => {
    const distractors: string[] = [];
    const seen = new Set<string>([q.meaning]);
    for (const r of shuffle(pool)) {
      if (distractors.length >= 3) break;
      if (!seen.has(r.meaning)) {
        seen.add(r.meaning);
        distractors.push(r.meaning);
      }
    }
    return {
      id: q.id,
      word: q.word,
      correct: q.meaning,
      choices: shuffle([q.meaning, ...distractors]),
    };
  });

  return NextResponse.json({ ok: true, questions });
}
