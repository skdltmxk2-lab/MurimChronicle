/**
 * 코칭 스튜디오 문제지의 "인쇄 지오메트리" CSS. 화면 미리보기는 인쇄와 글자 크기·여백이 달라서,
 * 인쇄될 때 문항이 실제로 얼마나 차지하는지 재거나(usePrintPagination) PDF 로 찍을 때
 * (pdf-builder) 같은 규칙을 쓴다. @media print 규칙을 scope 아래로 옮겨 적은 것이라
 * 둘 중 하나를 고치면 AdminCoachingClient 의 @media print 블록도 함께 맞춰야 한다.
 *
 * scope 는 `#some-id` 같은 선택자. 호스트 요소는 문서 맨 위가 아니라 이 scope 안에서만 적용된다.
 *
 * .coaching-print-grid 의 행을 minmax(0, 1fr) 로 고정한 이유: 단은 repeat(3, minmax(max-content, 1fr))
 * 라서, 높이를 모르는 상태로 크기를 잴 때 세 칸이 모두 그 단의 가장 긴 문항 높이로 맞춰진다.
 * 행이 auto 면 이 값이 두 단이 함께 쓰는 행을 늘려, 정작 내용이 짧은 옆 단의 세 번째 문항까지
 * 페이지 아래로 밀려 잘렸다. 행을 페이지 높이에 고정하면 각 단은 제 높이 안에서만 칸을 나눈다.
 */
export function buildPrintGeometryCss(scope: string): string {
  return `
${scope}, ${scope} * { content-visibility: visible !important; contain-intrinsic-size: none !important; }
${scope} { color-scheme: light; color: #000; background: #fff; }
${scope} .admin-screen-only { display: none !important; }
${scope} .coaching-print-page {
  width: 210mm !important; height: 296mm !important; max-height: 296mm !important;
  min-height: 0 !important; padding: 12mm !important; margin: 0 !important;
  box-sizing: border-box !important; display: flex !important; flex-direction: column !important;
  border: 0 !important; border-radius: 0 !important; box-shadow: none !important;
  background: #fff !important; background-image: none !important; overflow: hidden !important;
  transform: none !important; content-visibility: visible !important; contain: none !important;
}
${scope} .coaching-print-header { display: none !important; }
${scope} .coaching-page-custom-header {
  border-bottom: 0.25mm solid #111 !important; padding: 0 0 3mm !important;
  margin: 0 !important; font-size: 10pt !important; font-weight: 900 !important;
  line-height: 1.4 !important; color: #000 !important;
}
${scope} .coaching-print-grid {
  display: grid !important; grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  grid-template-rows: minmax(0, 1fr) !important;
  column-gap: 0 !important; flex: 1 1 auto !important; height: auto !important;
  min-height: 0 !important; padding-top: 8mm !important; box-sizing: border-box !important;
  position: relative !important; background-image: none !important;
}
${scope} .coaching-print-column {
  min-width: 0 !important; display: grid !important;
  grid-template-rows: repeat(3, minmax(max-content, 1fr)) !important;
  gap: 4mm !important; align-items: start !important;
}
${scope} .coaching-print-column-left { padding: 0 6mm 0 0 !important; }
${scope} .coaching-print-column-right { border-left: 0.35mm solid #111 !important; padding: 0 0 0 6mm !important; }
${scope} .coaching-print-divider { display: none !important; }
${scope} .coaching-print-question {
  min-height: 0 !important; overflow: visible !important; border: 0 !important;
  border-radius: 0 !important; padding: 1.6mm 0 0 !important; font-size: 8pt !important;
  line-height: 1.48 !important; background: #fff !important;
}
${scope} .coaching-print-question-body { display: flex !important; align-items: flex-start !important; gap: 2mm !important; overflow: visible !important; }
${scope} .coaching-print-question-number { flex: 0 0 auto !important; font-size: 8pt !important; line-height: 1.48 !important; }
${scope} .coaching-print-content { font-size: 8pt !important; line-height: 1.48 !important; word-break: keep-all !important; overflow-wrap: break-word !important; overflow: visible !important; }
${scope} .coaching-print-question, ${scope} .coaching-print-question * { color: #000 !important; border-color: #111 !important; }
${scope} .coaching-print-question img { max-height: 36mm !important; object-fit: contain !important; }
${scope} .coaching-print-question .katex { font-size: 1em !important; white-space: normal !important; overflow: visible !important; }
${scope} .coaching-print-question :is(.katex-html, .base, .strut, .vlist-t, .vlist-r, .vlist) { overflow: visible !important; }
${scope} .coaching-print-question .katex-display { margin: 0.15em 0 !important; overflow: visible !important; text-align: left !important; }
${scope} .coaching-print-viewbox { border: 0.25mm solid #111 !important; padding: 1.8mm 2.2mm 2mm !important; margin: 1.8mm 0 1.4mm !important; background: #fff !important; }
${scope} .coaching-print-viewbox-title { margin-bottom: 1.2mm !important; }
${scope} .coaching-print-viewitems { gap: 1.2mm !important; }
${scope} .coaching-print-viewitem { gap: 1.8mm !important; }
${scope} .coaching-print-option { gap: 2mm !important; line-height: 1.45 !important; }
${scope} .coaching-print-option-label { width: 4mm !important; flex: 0 0 4mm !important; text-align: left !important; }
`;
}
