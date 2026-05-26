/**
 * 랜딩·시험페이지에서 보여줄 통계 수치 포맷터.
 * - QUESTIONS_FLOOR 만 바꾸면 모든 페이지(랜딩·시험·메타·OG 이미지)가 자동 반영된다.
 * - "10단위로 끊고 +" 표기: 5,210 → "5,210+", 7,520 → "7,520+".
 */

export const QUESTIONS_FLOOR = 7500;
export const EXAMS_FLOOR = Math.floor(QUESTIONS_FLOOR / 10); // 750

export function formatStat(count: number): string {
  if (count <= 0) return "-";
  if (count < 10) return String(count);
  return `${(Math.floor(count / 10) * 10).toLocaleString("ko-KR")}+`;
}

/** 문항 수 — 실제 < FLOOR면 FLOOR+ 로 표시 (마케팅 floor) */
export function formatQuestionStat(count: number): string {
  if (count >= QUESTIONS_FLOOR) return formatStat(count);
  return `${QUESTIONS_FLOOR.toLocaleString("ko-KR")}+`;
}

/** 모의고사 수 ≈ floor(문항수/10). FLOOR(QUESTIONS_FLOOR/10) 까지 자동으로 함께 올라감. */
export function formatExamStat(count: number): string {
  const exams = Math.floor(count / 10);
  if (exams >= EXAMS_FLOOR) return formatStat(exams);
  return `${EXAMS_FLOOR.toLocaleString("ko-KR")}+`;
}

/** 가입자 → 표시 학생 수.
 *   actual < 100 → actual × 2.5 (단 200 상한)
 *   actual ≥ 100 → actual × 2  (상한 해제)
 * 두 구간이 actual=100에서 자연스럽게 200으로 연결됨.
 */
export function computeDisplayedUsers(actual: number): number {
  if (actual >= 100) return Math.floor(actual * 2);
  return Math.min(Math.floor(actual * 2.5), 200);
}
