import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import {
  COACHING_STUDENT_SELECT,
  coachingStudentFromRow,
  coachingStudentStoreMessage,
  isMissingCoachingStudentStore,
} from "@/lib/admin/coachingStudents";

const MAX_NAME_LENGTH = 40;
const MAX_MEMO_LENGTH = 200;

function cleanStudentInput(body: { name?: unknown; memo?: unknown } | null) {
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const memo = typeof body?.memo === "string" ? body.memo.trim() : "";
  if (!name) return { ok: false as const, message: "학생 이름을 입력해 주세요." };
  if (name.length > MAX_NAME_LENGTH) {
    return { ok: false as const, message: `학생 이름은 ${MAX_NAME_LENGTH}자 이하로 입력해 주세요.` };
  }
  if (memo.length > MAX_MEMO_LENGTH) {
    return { ok: false as const, message: `메모는 ${MAX_MEMO_LENGTH}자 이하로 입력해 주세요.` };
  }
  return { ok: true as const, name, memo };
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.supabase
    .from("coaching_students")
    .select(COACHING_STUDENT_SELECT)
    .eq("teacher_id", auth.userId)
    .order("is_active", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    const message = isMissingCoachingStudentStore(error) ? coachingStudentStoreMessage() : error.message;
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    students: (data ?? []).map((row) => coachingStudentFromRow(row as Record<string, unknown>)),
  });
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as { name?: unknown; memo?: unknown } | null;
  const input = cleanStudentInput(body);
  if (!input.ok) {
    return NextResponse.json({ ok: false, message: input.message }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("coaching_students")
    .insert({
      teacher_id: auth.userId,
      name: input.name,
      memo: input.memo,
    })
    .select(COACHING_STUDENT_SELECT)
    .single();

  if (error) {
    const message = isMissingCoachingStudentStore(error) ? coachingStudentStoreMessage() : error.message;
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    student: coachingStudentFromRow(data as Record<string, unknown>),
  });
}
