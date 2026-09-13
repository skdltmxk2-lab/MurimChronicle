import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { isCoachingStudentId } from "@/lib/admin/coachingStudents";
import { studentOrderKey } from "@/lib/admin/coachingStudentOrder";

export async function PUT(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  const body = await request.json().catch(() => null) as { studentIds?: unknown } | null;
  const ids = body?.studentIds;
  if (!Array.isArray(ids) || ids.length === 0 || ids.length > 1000 ||
      !ids.every((id) => typeof id === "string" && isCoachingStudentId(id)) ||
      new Set(ids).size !== ids.length) {
    return NextResponse.json({ ok: false, message: "학생 순서가 올바르지 않습니다." }, { status: 400 });
  }

  // Validate against the full owned roster, not just the submitted IDs. A stale
  // browser must reload after another tab adds, deletes or archives a student.
  const { data, error } = await auth.supabase.from("coaching_students")
    .select("id").eq("teacher_id", auth.userId).eq("is_active", true);
  if (error) {
    return NextResponse.json({ ok: false, message: "학생 명단을 확인하지 못했습니다." }, { status: 500 });
  }
  const ownedIds = new Set((data ?? []).map((student) => student.id));
  if (ownedIds.size !== ids.length || !ids.every((id) => ownedIds.has(id))) {
    return NextResponse.json({ ok: false, message: "학생 명단이 변경되었습니다. 새로고침 후 다시 정렬해 주세요." }, { status: 409 });
  }
  // One teacher-scoped setting is written atomically; student rows and usage
  // history are unchanged. The existing settings table is service-role only.
  const { error: saveError } = await auth.supabase.from("app_settings").upsert({
    key: studentOrderKey(auth.userId), value: JSON.stringify(ids), updated_at: new Date().toISOString(),
  });
  if (saveError) {
    return NextResponse.json({ ok: false, message: "학생 순서 저장에 실패했습니다. 다시 시도해 주세요." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, studentOrder: ids });
}
