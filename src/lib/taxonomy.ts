import type { Difficulty } from "@/types/exam";

export const SUBJECTS = [
  { name: "미분학", emoji: "📘", desc: "함수, 극한, 미분, 평균값 정리, Taylor급수, 곡선의 개형" },
  { name: "적분학", emoji: "📗", desc: "부정적분, 정적분, 무한급수, 특이적분, 정적분의 응용" },
  { name: "선형대수", emoji: "📕", desc: "행렬, 벡터, 벡터공간, 고유치와 대각화, 선형사상" },
  { name: "다변수함수", emoji: "📙", desc: "편도함수, 방향도함수, 중적분, 선적분과 면적분" },
  { name: "공학수학", emoji: "📓", desc: "복소수, 미분방정식, Laplace변환, Fourier급수" }
] as const;

export type SubjectName = (typeof SUBJECTS)[number]["name"];

export const SUBJECT_UNITS: Record<SubjectName, readonly string[]> = {
  미분학: [
    "함수",
    "극한과 연속",
    "미분",
    "접선의 방정식",
    "평균값의 정리 및 로피탈 정리",
    "Taylor급수",
    "곡선의 개형",
    "최대/최소",
    "순간 변화율",
    "추가내용"
  ],
  적분학: [
    "부정적분",
    "정적분의 계산",
    "정적분과 무한급수",
    "정적분의 성질",
    "특이적분",
    "Maclaurin급수의 응용",
    "정적분의 응용",
    "극좌표와 응용"
  ],
  선형대수: [
    "행렬",
    "벡터와 공간도형",
    "벡터공간",
    "고유치와 대각화",
    "선형사상",
    "추가내용"
  ],
  다변수함수: [
    "편도함수",
    "경도 및 방향도함수",
    "곡선과 곡면",
    "Taylor급수와 최대/최소",
    "중적분",
    "체적과 곡면적",
    "삼중적분과 극좌표계",
    "무한급수",
    "선적분과 면적분",
    "추가내용"
  ],
  공학수학: [
    "복소수",
    "미분방정식",
    "Laplace변환",
    "푸리에(Fourier) 급수"
  ]
};

export const SUBJECT_NAMES: SubjectName[] = SUBJECTS.map((s) => s.name) as SubjectName[];

export function isKnownSubject(value: string): value is SubjectName {
  return (SUBJECT_NAMES as string[]).includes(value);
}

export function unitsForSubject(subject: string): readonly string[] {
  return isKnownSubject(subject) ? SUBJECT_UNITS[subject] : [];
}

export const DIFFICULTY_KEYS: Difficulty[] = [
  "easy",
  "easyMedium",
  "medium",
  "mediumHard",
  "hard",
  "killer"
];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "하",
  easyMedium: "중하",
  medium: "중",
  mediumHard: "중상",
  hard: "상",
  killer: "킬러"
};

export const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  easy: "bg-mint-50 text-mint-600 ring-mint-600/15",
  easyMedium: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  medium: "bg-amber-50 text-amber-700 ring-amber-600/15",
  mediumHard: "bg-orange-50 text-orange-700 ring-orange-600/15",
  hard: "bg-coral-50 text-coral-600 ring-coral-600/15",
  killer: "bg-slate-900 text-white ring-slate-900/15"
};
