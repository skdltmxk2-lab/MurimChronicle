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
  const count = Math.min(40, Math.max(5, Number(url.searchParams.get("count")) || 10));
  const setParam = url.searchParams.get("set");
  const sizeParam = url.searchParams.get("size");

  let questionWords: WordRow[] = [];
  let setMeta: { setIndex: number; size: number; totalSets: number } | null = null;

  if (setParam) {
    // 정렬 모드: 등록 순서 기준으로 size개씩 끊어 set 번호의 묶음을 가져온다
    const size = Math.min(40, Math.max(5, Number(sizeParam) || 20));
    const setIndex = Math.max(1, Math.floor(Number(setParam) || 1));

    const { data: totalData } = await auth.supabase.rpc("english_words_total");
    const total = (totalData as number | null) ?? 0;
    const totalSets = Math.max(1, Math.ceil(total / size));
    const safeSet = Math.min(setIndex, totalSets);
    const offset = (safeSet - 1) * size;

    const { data, error } = await auth.supabase.rpc("english_words_slice", {
      p_offset: offset,
      p_limit: size,
    });
    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    questionWords = ((data ?? []) as WordRow[]).slice();
    setMeta = { setIndex: safeSet, size, totalSets };

    if (questionWords.length < 4) {
      return NextResponse.json({
        ok: true,
        questions: [],
        setMeta,
        message: "이 세트의 단어가 부족해요.",
      });
    }
  } else {
    // 기존 무작위 모드(데일리 등 다른 곳에서 호환용)
    const { data, error } = await auth.supabase.rpc("random_english_words", { p_count: count * 4 });
    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    const pool = (data ?? []) as WordRow[];
    if (pool.length < 4) {
      return NextResponse.json({
        ok: true,
        questions: [],
        message: "등록된 단어가 부족해요. 관리자에서 단어를 추가해 주세요.",
      });
    }
    questionWords = pool.slice(0, count);
  }

  // 오답 후보: 정답으로 쓰인 단어를 제외하고 풀에서 랜덤 가져오기
  const excludeIds = questionWords.map((w) => w.id);
  const { data: distractorData } = await auth.supabase.rpc("english_words_distractors", {
    p_exclude: excludeIds,
    p_limit: Math.max(questionWords.length * 4, 12),
  });
  const distractorPool = shuffle(((distractorData ?? []) as WordRow[]).map((d) => d.meaning));
  const myMeanings = new Set(questionWords.map((w) => w.meaning));

  const questions = questionWords.map((q) => {
    const distractors: string[] = [];
    const seen = new Set<string>([q.meaning]);
    for (const m of distractorPool) {
      if (distractors.length >= 3) break;
      if (!seen.has(m) && !myMeanings.has(m)) {
        seen.add(m);
        distractors.push(m);
      }
    }
    if (distractors.length < 3) {
      for (const w of shuffle(questionWords)) {
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
      choices: shuffle([q.meaning, ...distractors]),
    };
  });

  return NextResponse.json({ ok: true, questions, setMeta });
}
