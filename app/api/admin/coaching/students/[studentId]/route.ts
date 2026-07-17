import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import {
  COACHING_STUDENT_SELECT,
  coachingStudentFromRow,
  coachingStudentStoreMessage,
  isCoachingStudentId,
  isMissingCoachingStudentStore,
} from "@/lib/admin/coachingStudents";

const MAX_NAME_LENGTH = 40;
const MAX_MEMO_LENGTH = 200;

type RouteContext = { params: Promise<{ studentId: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { studentId } = await params;
  if (!isCoachingStudentId(studentId)) {
    return NextResponse.json({ ok: false, message: "학생 ID가 올바르지 않습니다." }, { status: 400 });
  }
  const body = (await request.json().catch(() => null)) as
    | { name?: unknown; memo?: unknown; isActive?: unknown }
    | null;
  if (!body) {
    return NextResponse.json({ ok: false, message: "잘못된 요청입니다." }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.name !== undefined) {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      return NextResponse.json({ ok: false, message: "학생 이름을 입력해 주세요." }, { status: 400 });
    }
    if (name.length > MAX_NAME_LENGTH) {
      return NextResponse.json(
        { ok: false, message: `학생 이름은 ${MAX_NAME_LENGTH}자 이하로 입력해 주세요.` },
        { status: 400 }
      );
    }
    updates.name = name;
  }
  if (body.memo !== undefined) {
    const memo = typeof body.memo === "string" ? body.memo.trim() : "";
    if (memo.length > MAX_MEMO_LENGTH) {
      return NextResponse.json(
        { ok: false, message: `메모는 ${MAX_MEMO_LENGTH}자 이하로 입력해 주세요.` },
        { status: 400 }
      );
    }
    updates.memo = memo;
  }
  if (body.isActive !== undefined) {
    if (typeof body.isActive !== "boolean") {
      return NextResponse.json({ ok: false, message: "학생 상태 값이 올바르지 않습니다." }, { status: 400 });
    }
    updates.is_active = body.isActive;
  }
  if (Object.keys(updates).length === 1) {
    return NextResponse.json({ ok: false, message: "변경할 항목이 없습니다." }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("coaching_students")
    .update(updates)
    .eq("id", studentId)
    .eq("teacher_id", auth.userId)
    .select(COACHING_STUDENT_SELECT)
    .maybeSingle();

  if (error) {
    const message = isMissingCoachingStudentStore(error) ? coachingStudentStoreMessage() : error.message;
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ ok: false, message: "학생을 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    student: coachingStudentFromRow(data as Record<string, unknown>),
  });
}
