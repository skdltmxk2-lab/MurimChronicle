/**
 * 약관·개인정보처리방침에 들어가는 운영주체 정보.
 * ▼▼▼ 실제 게시 전 아래 [대괄호] 값들을 실제 정보로 채워주세요 ▼▼▼
 * (변호사 검토 권장 — 아래 문서는 표준 양식 기반 초안입니다.)
 */
export const LEGAL = {
  serviceName: "루트매쓰 CBT",
  operator: "[운영자(상호)명]",
  representative: "[대표자명]",
  businessNumber: "[사업자등록번호 — 개인(비사업자)이면 '해당 없음']",
  address: "[사업장 주소 — 비공개 시 생략 가능]",
  contactEmail: "skdltmxk2@gmail.com",
  privacyOfficer: "[개인정보 보호책임자 성명]",
  effectiveDate: "2026년 5월 26일",
  jurisdiction: "대한민국",
} as const;
