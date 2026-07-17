import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import {
  coachingStudentStoreMessage,
  findOwnedCoachingStudent,
  isCoachingStudentId,
  isMissingCoachingStudentStore,
} from "@/lib/admin/coachingStudents";

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as
    | { studentId?: unknown; questionIds?: unknown[] }
    | null;
  const studentId = typeof body?.studentId === "string" ? body.studentId.trim() : "";
  const questionIds = Array.from(
    new Set(
      Array.isArray(body?.questionIds)
        ? body.questionIds.filter((id): id is string => typeof id === "string" && id.trim().length > 0)
        : []
    )
  );

  if (!studentId) {
    return NextResponse.json({ ok: false, message: "출제 대상 학생을 선택해 주세요." }, { status: 400 });
  }
  if (!isCoachingStudentId(studentId)) {
    return NextResponse.json({ ok: false, message: "학생 ID가 올바르지 않습니다." }, { status: 400 });
  }

  if (questionIds.length === 0) {
    return NextResponse.json({ ok: false, message: "기록할 문제 ID가 없습니다." }, { status: 400 });
  }
  if (questionIds.length > 60) {
    return NextResponse.json({ ok: false, message: "한 번에 최대 60문항까지 기록할 수 있습니다." }, { status: 400 });
  }

  const ownedStudent = await findOwnedCoachingStudent(auth.supabase, auth.userId, studentId);
  if (ownedStudent.error) {
    const message = isMissingCoachingStudentStore(ownedStudent.error)
      ? coachingStudentStoreMessage()
      : ownedStudent.error.message;
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
  if (!ownedStudent.student) {
    return NextResponse.json(
      { ok: false, message: "선택한 학생을 찾을 수 없습니다. 학생 명단을 새로고침해 주세요." },
      { status: 404 }
    );
  }

  const { data, error } = await auth.supabase.rpc("record_coaching_student_question_usage", {
    p_teacher_id: auth.userId,
    p_student_id: ownedStudent.student.id,
    p_question_ids: questionIds,
  });

  if (error) {
    const message = isMissingCoachingStudentStore(error)
      ? coachingStudentStoreMessage()
      : error.message;
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    student: ownedStudent.student,
    usage: ((data ?? []) as Array<Record<string, unknown>>).map((row) => ({
      questionId: row.question_id as string,
      useCount: Number(row.use_count ?? 0),
      lastUsedAt: (row.last_used_at as string | null) ?? null,
    })),
  });
}
