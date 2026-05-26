import { NextResponse } from "next/server";
import { requireTier } from "@/lib/auth/requireTier";

const DAILY_COUNT = 10;

type WordRow = { id: number; word: string; meaning: string };

function shuffle<T>(arr: T[], seed: number): T[] {
  // 결정적 셔플(같은 날짜·같은 단어 묶음이면 동일한 보기 순서)
  const a = [...arr];
  let s = seed || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function epochDay(d: Date): number {
  return Math.floor(d.getTime() / 86_400_000);
}

export async function GET(request: Request) {
  const auth = await requireTier(request, "free");
  if (!auth.ok) return auth.response;

  const { data: totalData } = await auth.supabase.rpc("english_words_total");
  const total = (totalData as number | null) ?? 0;
  if (total < 4) {
    return NextResponse.json({
      ok: true,
      questions: [],
      message: "등록된 단어가 부족해요. 관리자에서 단어를 추가해 주세요.",
    });
  }

  const seed = epochDay(new Date());
  const offset = ((seed * DAILY_COUNT) % Math.max(total, 1) + Math.max(total, 1)) % Math.max(total, 1);
  const overflow = offset + DAILY_COUNT - total;

  let words: WordRow[] = [];
  {
    const { data, error } = await auth.supabase.rpc("english_words_slice", {
      p_offset: offset,
      p_limit: Math.min(DAILY_COUNT, total - offset),
    });
    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    words = ((data ?? []) as WordRow[]).slice();
  }
  if (overflow > 0) {
    const { data, error } = await auth.supabase.rpc("english_words_slice", {
      p_offset: 0,
      p_limit: overflow,
    });
    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    words = words.concat(((data ?? []) as WordRow[]));
  }

  // 오답 후보: 정답 단어 제외하고 풀에서 랜덤
  const excludeIds = words.map((w) => w.id);
  const { data: distractorData } = await auth.supabase.rpc("english_words_distractors", {
    p_exclude: excludeIds,
    p_limit: words.length * 4,
  });
  const distractorPool = ((distractorData ?? []) as WordRow[]).map((d) => d.meaning);
  const seenMeanings = new Set(words.map((w) => w.meaning));

  const questions = words.map((q, qi) => {
    const distractors: string[] = [];
    const seen = new Set<string>([q.meaning]);
    for (const m of distractorPool) {
      if (distractors.length >= 3) break;
      if (!seen.has(m) && !seenMeanings.has(m)) {
        seen.add(m);
        distractors.push(m);
      }
    }
    // 모자라면 다른 정답 뜻으로 채움(중복 방지)
    if (distractors.length < 3) {
      for (const w of words) {
        if (distractors.length >= 3) break;
        if (w.meaning !== q.meaning && !seen.has(w.meaning)) {
          seen.add(w.meaning);
          distractors.push(w.meaning);
        }
      }
    }
    return {
      id: q.id,
      word: q.word,
      correct: q.meaning,
      choices: shuffle([q.meaning, ...distractors], seed + qi),
    };
  });

  return NextResponse.json({ ok: true, questions, seed });
}
