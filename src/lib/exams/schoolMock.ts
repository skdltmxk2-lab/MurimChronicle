export const SCHOOL_MOCK_NAMES = {
  sogang: "서강대학교",
  skku: "성균관대학교",
  hanyang: "한양대학교",
  cau: "중앙대학교",
  ewha: "이화여자대학교",
  kyunghee: "경희대학교",
  konkuk: "건국대학교",
} as const;

export type SchoolMockCode = keyof typeof SCHOOL_MOCK_NAMES;

export function isSchoolMockCode(value: string): value is SchoolMockCode {
  return Object.hasOwn(SCHOOL_MOCK_NAMES, value);
}

export function schoolMockApi(school: SchoolMockCode) {
  return `/api/student/exams/school-mock/${school}`;
}

export function schoolMockExamId(school: SchoolMockCode, round: number) {
  return `school-${school}-${round}`;
}

export function schoolMockProblemSheetName(school: SchoolMockCode, round: number) {
  return `${SCHOOL_MOCK_NAMES[school]} 모의고사 ${round}회 문제지.pdf`;
}

export function schoolMockFromExamId(examId: string): { school: SchoolMockCode; round: number } | null {
  const match = /^school-([a-z]+)-([1-9]\d{0,2})$/.exec(examId);
  return match && isSchoolMockCode(match[1]) ? { school: match[1], round: Number(match[2]) } : null;
}
