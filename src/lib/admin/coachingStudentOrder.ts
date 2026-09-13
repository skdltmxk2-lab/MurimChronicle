type Student = { id: string; name: string; isActive: boolean };

export function parseStudentOrder(value: string | null | undefined): string[] {
  try {
    const parsed: unknown = JSON.parse(value ?? "[]");
    return Array.isArray(parsed) && parsed.every((id) => typeof id === "string")
      ? Array.from(new Set(parsed)) : [];
  } catch {
    return [];
  }
}

export function sortCoachingStudents<T extends Student>(students: readonly T[], order: readonly string[] = []): T[] {
  const positions = new Map(order.map((id, index) => [id, index]));
  return [...students].sort((left, right) => {
    if (left.isActive !== right.isActive) return left.isActive ? -1 : 1;
    const position = (positions.get(left.id) ?? order.length) - (positions.get(right.id) ?? order.length);
    return position || left.name.localeCompare(right.name, "ko") || left.id.localeCompare(right.id);
  });
}

export function moveCoachingStudent(ids: readonly string[], source: string, target: string): string[] {
  const from = ids.indexOf(source), to = ids.indexOf(target);
  if (from < 0 || to < 0 || from === to) return [...ids];
  const next = [...ids];
  next.splice(from, 1);
  next.splice(to, 0, source);
  return next;
}

export function studentOrderKey(teacherId: string) {
  return `coaching_student_order:${teacherId}`;
}
