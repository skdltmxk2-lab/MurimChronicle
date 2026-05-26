import type { SubjectName } from "@/lib/taxonomy";

/**
 * 데일리 테스트의 월별 학습 범위.
 * 실제 편입 커리큘럼 진도를 고려해, 아직 배우지 않은 과목이 데일리에 섞이지 않도록 제한한다.
 *   1~2월   → 미분학
 *   3~4월   → 미분학 + 적분학
 *   5~6월   → 적분학 + 선형대수
 *   7~8월   → 선형대수 + 다변수함수
 *   9~11월  → 선형대수 + 다변수함수 + 공학수학
 *   12월    → 전 과목 (마무리 복습 시즌)
 */
export function allowedSubjectsForMonth(month: number): SubjectName[] {
  if (month <= 2) return ["미분학"];
  if (month <= 4) return ["미분학", "적분학"];
  if (month <= 6) return ["적분학", "선형대수"];
  if (month <= 8) return ["선형대수", "다변수함수"];
  if (month <= 11) return ["선형대수", "다변수함수", "공학수학"];
  return ["미분학", "적분학", "선형대수", "다변수함수", "공학수학"];
}

/** "YYYY-MM-DD" → 월(1~12). 형식이 깨졌으면 오늘 월로 폴백. */
export function monthFromDateString(dateStr?: string | null): number {
  if (dateStr) {
    const m = Number(dateStr.split("-")[1]);
    if (Number.isFinite(m) && m >= 1 && m <= 12) return m;
  }
  return new Date().getMonth() + 1;
}

/** 표시용 라벨 — 카드 부제 등에 활용. */
export function allowedSubjectsLabel(month: number): string {
  return allowedSubjectsForMonth(month).join(" · ");
}
