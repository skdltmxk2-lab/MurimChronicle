export const KONKUK_SCHOOL_NAME = "건국대학교";
export const KONKUK_SCHOOL_MOCK_ROUNDS = [1, 2, 3] as const;

export type KonkukSchoolMockRound = (typeof KONKUK_SCHOOL_MOCK_ROUNDS)[number];

export function konkukProblemSheetName(round: KonkukSchoolMockRound) {
  return `건국대학교_모의고사_${round}회_문제지.pdf`;
}
