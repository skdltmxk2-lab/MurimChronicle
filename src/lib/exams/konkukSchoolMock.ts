export const KONKUK_SCHOOL_NAME = "건국대학교";
export const KONKUK_SCHOOL_MOCK_API = "/api/student/exams/school-mock/konkuk";

export function konkukExamId(round: number) {
  return `school-konkuk-${round}`;
}

export function konkukRoundFromExamId(examId: string): number | null {
  const match = /^school-konkuk-([1-9]\d{0,2})$/.exec(examId);
  return match ? Number(match[1]) : null;
}
