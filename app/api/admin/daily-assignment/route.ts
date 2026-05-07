import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const FALLBACK_ADMIN_PASSWORD = "routeroute";

function checkAdmin(request: Request): boolean {
  const expected = process.env.ADMIN_PASSWORD || FALLBACK_ADMIN_PASSWORD;
  const provided = request.headers.get("x-admin-password");
  return Boolean(provided) && provided === expected;
}

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function todayDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export async function GET(request: Request) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ ok: false, message: "관리자 권한이 필요합니다." }, { status: 401 });
  }

  const url = new URL(request.url);
  const date = url.searchParams.get("date") || todayDate();

  const supabase = adminClient();
  const { data, error } = await supabase
    .from("daily_assignments")
    .select("date, question_ids, updated_at")
    .eq("date", date)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    date,
    assignment: data ? {
      date: data.date,
      questionIds: data.question_ids as string[],
      updatedAt: data.updated_at,
    } : null,
  });
}

export async function POST(request: Request) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ ok: false, message: "관리자 권한이 필요합니다." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { date?: string; questionIds?: string[] }
    | null;
  if (!body || !Array.isArray(body.questionIds) || body.questionIds.length === 0) {
    return NextResponse.json({ ok: false, message: "questionIds가 필요합니다." }, { status: 400 });
  }
  const date = body.date || todayDate();
  const ids = body.questionIds;

  const supabase = adminClient();

  const { error: upsertError } = await supabase
    .from("daily_assignments")
    .upsert({ date, question_ids: ids, updated_at: new Date().toISOString() });
  if (upsertError) {
    return NextResponse.json({ ok: false, message: upsertError.message }, { status: 500 });
  }

  // 사용 이력 갱신
  const { data: existing } = await supabase
    .from("daily_usage")
    .select("question_id, use_count")
    .in("question_id", ids);
  const countMap = new Map<string, number>();
  for (const row of existing ?? []) countMap.set(row.question_id as string, (row.use_count as number) ?? 0);

  const usageRows = ids.map((qid) => ({
    question_id: qid,
    last_used_date: date,
    use_count: (countMap.get(qid) ?? 0) + 1,
    updated_at: new Date().toISOString(),
  }));
  await supabase.from("daily_usage").upsert(usageRows);

  return NextResponse.json({ ok: true, date, questionIds: ids });
}

export async function DELETE(request: Request) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ ok: false, message: "관리자 권한이 필요합니다." }, { status: 401 });
  }

  const url = new URL(request.url);
  const date = url.searchParams.get("date") || todayDate();

  const supabase = adminClient();
  const { error } = await supabase.from("daily_assignments").delete().eq("date", date);
  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, date });
}
