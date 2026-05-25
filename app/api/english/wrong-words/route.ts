import { NextResponse } from "next/server";
import { requireTier } from "@/lib/auth/requireTier";

// 틀린 단어 목록 조회
export async function GET(request: Request) {
  const auth = await requireTier(request, "free");
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.supabase
    .from("english_wrong_words")
    .select("word_id, wrong_count, last_wrong_at, english_words(word, meaning)")
    .eq("user_id", auth.userId)
    .order("last_wrong_at", { ascending: false })
    .limit(500);
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

  const items = (data ?? []).map((r) => {
    const w = r.english_words as unknown as { word: string; meaning: string } | null;
    return {
      wordId: r.word_id as number,
      word: w?.word ?? "",
      meaning: w?.meaning ?? "",
      wrongCount: (r.wrong_count as number) ?? 1,
      lastWrongAt: r.last_wrong_at as string,
    };
  });
  return NextResponse.json({ ok: true, items });
}

// 틀린 단어 기록(추가) 또는 제거(외움)
export async function POST(request: Request) {
  const auth = await requireTier(request, "free");
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as
    | { wrongIds?: number[]; remove?: number }
    | null;

  if (typeof body?.remove === "number") {
    const { error } = await auth.supabase
      .from("english_wrong_words")
      .delete()
      .eq("user_id", auth.userId)
      .eq("word_id", body.remove);
    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  const ids = Array.isArray(body?.wrongIds)
    ? body!.wrongIds.filter((x) => typeof x === "number").slice(0, 50)
    : [];
  for (const id of ids) {
    await auth.supabase.rpc("record_wrong_word", { p_user_id: auth.userId, p_word_id: id });
  }
  return NextResponse.json({ ok: true, recorded: ids.length });
}
