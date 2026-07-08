import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";

function isMissingUsageStore(error: { code?: string; message?: string }) {
  const message = error.message ?? "";
  return (
    error.code === "42P01" ||
    error.code === "42883" ||
    error.code === "PGRST202" ||
    message.includes("coaching_unit_mock_usage") ||
    message.includes("record_coaching_unit_mock_usage")
  );
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as { questionIds?: unknown[] } | null;
  const questionIds = Array.from(
    new Set(
      Array.isArray(body?.questionIds)
        ? body.questionIds.filter((id): id is string => typeof id === "string" && id.trim().length > 0)
        : []
    )
  );

  if (questionIds.length === 0) {
    return NextResponse.json({ ok: false, message: "기록할 문제 ID가 없습니다." }, { status: 400 });
  }

  const { error } = await auth.supabase.rpc("record_coaching_unit_mock_usage", {
    p_question_ids: questionIds,
  });

  if (error) {
    const message = isMissingUsageStore(error)
      ? "코칭 사용 이력 테이블이 없습니다. 최신 Supabase 마이그레이션을 적용해 주세요."
      : error.message;
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }

  const { data, error: readError } = await auth.supabase
    .from("coaching_unit_mock_usage")
    .select("question_id, use_count, last_used_at")
    .in("question_id", questionIds);

  if (readError) {
    return NextResponse.json({ ok: false, message: readError.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    usage: (data ?? []).map((row) => ({
      questionId: row.question_id as string,
      useCount: Number(row.use_count ?? 0),
      lastUsedAt: (row.last_used_at as string | null) ?? null,
    })),
  });
}
