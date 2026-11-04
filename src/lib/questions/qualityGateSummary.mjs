// 품질 게이트 결과 한 줄 요약 — import 없음 (클라이언트 컴포넌트에서 직접 쓴다)
// ─────────────────────────────────────────────────────────────────────────────
// 화면 알림용 한 줄 요약 (코칭 스튜디오)
// ─────────────────────────────────────────────────────────────────────────────
// 경고 등급 코드의 알림 문구. 규칙표(GATE_RULES)의 설명보다 짧게 쓴다.
const WARNING_LABELS = {
  missing_explanation: "해설 없음",
  image_check_failed: "이미지 확인 실패",
  print_clip_risk: "인쇄 잘림 주의",
};

/**
 * @param report 서버 응답의 qualityGate (QualityGateResponse)
 * @returns 알림 끝에 붙일 한 줄. 표시할 게 없으면 "".
 */
export function summarizeGateReport(report) {
  if (!report || report.mode === "off" || !report.inspected) return "";
  const parts = [];
  const n = (list) => (Array.isArray(list) ? list.length : 0);
  if (report.mode === "enforce") {
    parts.push(`품질 검사 ${report.inspected}문항`);
    if (n(report.autoFixed)) parts.push(`자동 수정 ${n(report.autoFixed)}`);
    if (n(report.quarantined)) parts.push(`오류로 교체 ${n(report.quarantined)}`);
    if (n(report.suspectSkipped)) parts.push(`의심 문항 제외 ${n(report.suspectSkipped)}`);
    if (n(report.suspectUsed)) parts.push(`의심 문항 포함 ${n(report.suspectUsed)}(대체 후보 없음)`);
  } else {
    parts.push(`품질 검사(검사만) ${report.inspected}문항`);
    if (n(report.quarantined)) parts.push(`실제 모드였다면 교체 ${n(report.quarantined)}`);
    if (n(report.suspectSkipped)) parts.push(`의심 ${n(report.suspectSkipped)}`);
    if (n(report.autoFixed)) parts.push(`자동 수정 대상 ${n(report.autoFixed)}`);
    if (report.downgradeReason === "migration_missing") parts.push("DB 준비 전이라 검사만 실행");
  }
  const warningCounts = new Map();
  for (const item of Array.isArray(report.warnings) ? report.warnings : []) {
    for (const code of Array.isArray(item?.codes) ? item.codes : []) {
      warningCounts.set(code, (warningCounts.get(code) ?? 0) + 1);
    }
  }
  for (const [code, count] of warningCounts) {
    parts.push(`${WARNING_LABELS[code] ?? report.labels?.[code] ?? code} ${count}`);
  }
  if (n(report.gateFailed)) parts.push(`검사 오류 ${n(report.gateFailed)}`);
  if (report.writeErrors) parts.push(`기록 실패 ${report.writeErrors}`);
  return parts.join(" · ");
}
