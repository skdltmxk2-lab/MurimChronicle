// 단답형 답 정규화 + 비교 유틸
// 사용자 입력은 보통 일반 텍스트("2/9", "11", "sqrt(3)/3")이고
// 정답은 LaTeX 표현 ($\dfrac{2}{9}$, $11$, $\dfrac{\sqrt{3}}{3}$)로 저장돼 있다.
// 양쪽 모두 동일 표준 형태로 정규화한 뒤 일치 여부를 본다.

export function normalizeAnswer(raw: string): string {
  if (!raw) return "";
  let s = String(raw);

  // LaTeX 달러/공백 제거
  s = s.replace(/\$/g, "");
  s = s.replace(/\\,|\\;|\\:|\\!|\\quad|\\qquad/g, "");
  // \left, \right (괄호 보조)
  s = s.replace(/\\left|\\right/g, "");
  // 분수: \dfrac{a}{b} / \frac{a}{b} / \tfrac{a}{b} → (a)/(b)
  s = s.replace(/\\[dt]?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, "($1)/($2)");
  // 제곱근: \sqrt{a} → sqrt(a)
  s = s.replace(/\\sqrt\s*\{([^{}]*)\}/g, "sqrt($1)");
  s = s.replace(/\\sqrt\s+([^\s]+)/g, "sqrt($1)");
  // 그리스 문자/상수
  s = s.replace(/\\pi/g, "pi");
  s = s.replace(/\\infty/g, "inf");
  s = s.replace(/\\cdot/g, "*");
  s = s.replace(/\\times/g, "*");
  // 거듭제곱 ^{n} → ^n
  s = s.replace(/\^\s*\{([^{}]*)\}/g, "^$1");
  // 모든 \명령 텍스트 잔재 제거 (\ln, \cos 등은 단답에 거의 안 나오지만)
  s = s.replace(/\\([a-zA-Z]+)/g, "$1");
  // 공백, 중괄호 전부 제거
  s = s.replace(/[\s{}]/g, "");
  // 소수점 끝 0 정리 (선택): "1.50" → "1.5"
  s = s.replace(/(\.\d*?)0+(?=$|[^0-9])/g, "$1");
  s = s.replace(/\.(?=$|[^0-9])/g, "");
  return s.toLowerCase();
}

export function answersMatch(userInput: string, correct: string): boolean {
  if (!userInput || !correct) return false;
  const u = normalizeAnswer(userInput);
  const c = normalizeAnswer(correct);
  if (!u || !c) return false;
  if (u === c) return true;
  // 수치 비교: 양쪽이 단순 수면 부동소수점으로 비교
  const un = Number(u);
  const cn = Number(c);
  if (Number.isFinite(un) && Number.isFinite(cn)) {
    return Math.abs(un - cn) < 1e-9;
  }
  return false;
}
