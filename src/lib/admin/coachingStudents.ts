import type { SupabaseClient } from "@supabase/supabase-js";
import type { CoachingStudent } from "@/types/coaching";

export const COACHING_STUDENT_SELECT = "id, name, memo, is_active, created_at, updated_at";

export function coachingStudentFromRow(row: Record<string, unknown>): CoachingStudent {
  return {
    id: row.id as string,
    name: (row.name as string) ?? "",
    memo: (row.memo as string) ?? "",
    isActive: Boolean(row.is_active),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function findOwnedCoachingStudent(
  supabase: SupabaseClient,
  teacherId: string,
  studentId: string,
  activeOnly = true
): Promise<{ student: CoachingStudent | null; error: { code?: string; message: string } | null }> {
  let query = supabase
    .from("coaching_students")
    .select(COACHING_STUDENT_SELECT)
    .eq("id", studentId)
    .eq("teacher_id", teacherId);

  if (activeOnly) query = query.eq("is_active", true);

  const { data, error } = await query.maybeSingle();
  return {
    student: data ? coachingStudentFromRow(data as Record<string, unknown>) : null,
    error: error ? { code: error.code, message: error.message } : null,
  };
}

export async function findOwnedCoachingStudents(
  supabase: SupabaseClient,
  teacherId: string,
  studentIds: readonly string[],
  activeOnly = true
): Promise<{ students: CoachingStudent[]; error: { code?: string; message: string } | null }> {
  const ids = Array.from(new Set(studentIds.filter(Boolean)));
  if (ids.length === 0) return { students: [], error: null };

  let query = supabase
    .from("coaching_students")
    .select(COACHING_STUDENT_SELECT)
    .eq("teacher_id", teacherId)
    .in("id", ids);

  if (activeOnly) query = query.eq("is_active", true);

  const { data, error } = await query;
  const studentsById = new Map(
    (data ?? []).map((row) => {
      const student = coachingStudentFromRow(row as Record<string, unknown>);
      return [student.id, student] as const;
    })
  );
  return {
    students: ids.flatMap((id) => {
      const student = studentsById.get(id);
      return student ? [student] : [];
    }),
    error: error ? { code: error.code, message: error.message } : null,
  };
}

export function isMissingCoachingStudentStore(error: { code?: string; message?: string }) {
  const message = error.message ?? "";
  return (
    error.code === "42P01" ||
    error.code === "42883" ||
    error.code === "PGRST202" ||
    message.includes("coaching_students") ||
    message.includes("coaching_student_question_usage") ||
    message.includes("record_coaching_student_question_usage")
  );
}

export function coachingStudentStoreMessage() {
  return "학생별 출제 이력 테이블이 없습니다. 최신 Supabase 마이그레이션을 적용해 주세요.";
}

export function isCoachingStudentId(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
