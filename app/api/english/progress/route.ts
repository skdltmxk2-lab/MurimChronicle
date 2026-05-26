import { NextResponse } from "next/server";
import { requireTier } from "@/lib/auth/requireTier";

const WORDS_PER_DAY = 50;

export async function GET(request: Request) {
  const auth = await requireTier(request, "free");
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.supabase
    .from("english_word_progress")
    .select("current_day")
    .eq("user_id", auth.userId)
    .maybeSingle();
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

  const { data: totalData } = await auth.supabase.rpc("english_words_total");
  const total = (totalData as number | null) ?? 0;
  const maxDay = Math.max(1, Math.ceil(total / WORDS_PER_DAY));
  const currentDay = Math.min(Math.max((data?.current_day as number) ?? 1, 1), Math.max(maxDay, 1));

  return NextResponse.json({ ok: true, currentDay, maxDay, total, wordsPerDay: WORDS_PER_DAY });
}

export async function POST(request: Request) {
  const auth = await requireTier(request, "free");
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as { currentDay?: number } | null;
  const day = Math.max(1, Math.floor(Number(body?.currentDay) || 1));

  const { error } = await auth.supabase
    .from("english_word_progress")
    .upsert(
      { user_id: auth.userId, current_day: day, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, currentDay: day });
}
