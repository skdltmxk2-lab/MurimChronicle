// 품질 게이트 결과 한 줄 요약 — import 없음 (클라이언트 컴포넌트에서 직접 쓴다)
// ─────────────────────────────────────────────────────────────────────────────
// 화면 알림용 한 줄 요약 (코칭 스튜디오)
// ─────────────────────────────────────────────────────────────────────────────
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
  if (n(report.warnings)) parts.push(`인쇄 잘림 주의 ${n(report.warnings)}`);
  if (report.writeErrors) parts.push(`기록 실패 ${report.writeErrors}`);
  return parts.join(" · ");
}
