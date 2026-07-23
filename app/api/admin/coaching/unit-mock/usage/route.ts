import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import {
  coachingStudentStoreMessage,
  findOwnedCoachingStudents,
  isCoachingStudentId,
  isMissingCoachingStudentStore,
} from "@/lib/admin/coachingStudents";

const MAX_STUDENTS = 50;

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as
    | { studentId?: unknown; studentIds?: unknown[]; questionIds?: unknown[] }
    | null;
  const rawStudentIds = Array.isArray(body?.studentIds) ? body.studentIds : [body?.studentId];
  const studentIds = Array.from(
    new Set(
      rawStudentIds
        .filter((id): id is string => typeof id === "string")
        .map((id) => id.trim())
        .filter(Boolean)
    )
  );
  const questionIds = Array.from(
    new Set(
      Array.isArray(body?.questionIds)
        ? body.questionIds.filter((id): id is string => typeof id === "string" && id.trim().length > 0)
        : []
    )
  );

  if (studentIds.length === 0) {
    return NextResponse.json({ ok: false, message: "출제 대상 학생을 선택해 주세요." }, { status: 400 });
  }
  if (studentIds.length > MAX_STUDENTS) {
    return NextResponse.json(
      { ok: false, message: `출제 대상 학생은 최대 ${MAX_STUDENTS}명까지 선택할 수 있습니다.` },
      { status: 400 }
    );
  }
  if (studentIds.some((studentId) => !isCoachingStudentId(studentId))) {
    return NextResponse.json({ ok: false, message: "학생 ID가 올바르지 않습니다." }, { status: 400 });
  }

  if (questionIds.length === 0) {
    return NextResponse.json({ ok: false, message: "기록할 문제 ID가 없습니다." }, { status: 400 });
  }
  if (questionIds.length > 60) {
    return NextResponse.json({ ok: false, message: "한 번에 최대 60문항까지 기록할 수 있습니다." }, { status: 400 });
  }

  const ownedStudents = await findOwnedCoachingStudents(auth.supabase, auth.userId, studentIds);
  if (ownedStudents.error) {
    const message = isMissingCoachingStudentStore(ownedStudents.error)
      ? coachingStudentStoreMessage()
      : ownedStudents.error.message;
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
  if (ownedStudents.students.length !== studentIds.length) {
    return NextResponse.json(
      { ok: false, message: "선택한 학생 중 사용할 수 없는 학생이 있습니다. 학생 명단을 새로고침해 주세요." },
      { status: 404 }
    );
  }

  const results = await Promise.all(
    ownedStudents.students.map(async (student) => {
      const result = await auth.supabase.rpc("record_coaching_student_question_usage", {
        p_teacher_id: auth.userId,
        p_student_id: student.id,
        p_question_ids: questionIds,
      });
      return { student, ...result };
    })
  );

  const failed = results.find((result) => result.error);
  if (failed?.error) {
    const message = isMissingCoachingStudentStore(failed.error)
      ? coachingStudentStoreMessage()
      : failed.error.message;
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    students: ownedStudents.students,
    student: ownedStudents.students[0],
    usage: results.flatMap((result) =>
      ((result.data ?? []) as Array<Record<string, unknown>>).map((row) => ({
        studentId: result.student.id,
        questionId: row.question_id as string,
        useCount: Number(row.use_count ?? 0),
        lastUsedAt: (row.last_used_at as string | null) ?? null,
      }))
    ),
  });
}
