import { NextResponse } from "next/server";
import { requireTier } from "@/lib/auth/requireTier";

const WORDS_PER_DAY = 50;

type WordRow = { id: number; word: string; meaning: string };

export async function GET(request: Request) {
  const auth = await requireTier(request, "free");
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const day = Math.max(1, Math.floor(Number(url.searchParams.get("day")) || 1));

  const { data: totalData } = await auth.supabase.rpc("english_words_total");
  const total = (totalData as number | null) ?? 0;
  const maxDay = Math.max(1, Math.ceil(total / WORDS_PER_DAY));
  const safeDay = Math.min(day, Math.max(maxDay, 1));
  const offset = (safeDay - 1) * WORDS_PER_DAY;

  const { data, error } = await auth.supabase.rpc("english_words_slice", {
    p_offset: offset,
    p_limit: WORDS_PER_DAY,
  });
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

  const items = ((data ?? []) as WordRow[]).map((r) => ({
    id: r.id,
    word: r.word,
    meaning: r.meaning,
  }));

  return NextResponse.json({
    ok: true,
    day: safeDay,
    maxDay,
    total,
    wordsPerDay: WORDS_PER_DAY,
    items,
  });
}
