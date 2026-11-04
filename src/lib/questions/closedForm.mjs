// 닫힌 형태 수치 평가기 — 품질 게이트의 해설값·선지값 대조(N3)용.
//
// src/lib/admin/schoolMockCore.mjs(학교별 모고, 미배포)의 normalizeMathText / evalClosedForm 을
// 그대로 옮겨 왔다. 게이트가 학교 모고 코드에 의존하지 않게 하기 위함이며, 원본에 있던
// 중괄호 없는 근호 파싱 버그(`\\sqrt 2+1` → √(2+1))를 여기서는 고쳤다.
// import 없음.

/**
 * L0 전처리 (설계 §7.6 — AI-P0-2 수정판).
 *
 * 기존 normalize.ts 의 두 가지 실측 붕괴를 고친 정규화:
 *  ① frac·sqrt 를 중첩 1단계 대응 브레이스 패턴으로 변환하고 2회 적용해
 *     `\frac{\sqrt{3}}{3}` → `(sqrt(3))/(3)` 처럼 중첩 frac 까지 푼다.
 *  ② 정규화 문자열에 암시적 곱셈을 삽입한다(숫자·pi·e·sqrt(·( 인접 시 `*`) —
 *     `2pi` → `2*pi`, `3sqrt(2)` → `3*sqrt(2)` 가 L2 문법 안으로 들어온다.
 * L1 판정은 이 함수 출력의 문자열 일치다.
 */
export function normalizeMathText(text) {
  if (!text) return "";
  let s = String(text);

  s = s.replace(/\$/g, "");
  s = s.replace(/\\,|\\;|\\:|\\!|\\quad|\\qquad/g, "");
  s = s.replace(/\\left|\\right/g, "");
  // 중첩 1단계 대응 브레이스: \{((?:[^{}]|\{[^{}]*\})*)\} — 2회 적용으로 frac 안의 frac 까지 푼다
  const BRACE = "\\{((?:[^{}]|\\{[^{}]*\\})*)\\}";
  const fracPattern = new RegExp("\\\\[dt]?frac\\s*" + BRACE + "\\s*" + BRACE, "g");
  const sqrtPattern = new RegExp("\\\\sqrt\\s*" + BRACE, "g");
  for (let pass = 0; pass < 2; pass += 1) {
    s = s.replace(fracPattern, "($1)/($2)");
    s = s.replace(sqrtPattern, "sqrt($1)");
  }
  // 중괄호 없는 근호는 인자를 숫자 하나·문자 하나·\\pi 로 한정한다.
  // (`\\sqrt 2+1` 이 sqrt(2+1) 로 읽히던 버그 수정 — 원본 schoolMockCore 에는 아직 남아 있음)
  s = s.replace(/\\sqrt\s*(\d+(?:\.\d+)?|[a-zA-Z](?![a-zA-Z])|\\pi)/g, "sqrt($1)");
  s = s.replace(/\\pi/g, "pi");
  s = s.replace(/\\infty/g, "inf");
  s = s.replace(/\\cdot|\\times/g, "*");
  // 지수 중괄호는 괄호로 바꿔 묶음을 지킨다 (`10^{3/2}` 가 10^3/2 로, `e^{2\\pi}` 가 e^2·π 로 읽히던 버그 수정)
  s = s.replace(/\^\s*\{([^{}]*)\}/g, "^($1)");
  s = s.replace(/\\([a-zA-Z]+)/g, "$1");
  s = s.replace(/[\s{}]/g, "");
  s = s.replace(/(\.\d*?)0+(?=$|[^0-9])/g, "$1");
  s = s.replace(/\.(?=$|[^0-9])/g, "");
  s = s.toLowerCase();

  // 암시적 곱셈 삽입 — 순수 문자열 연산 (지수 표기 1e9 는 건드리지 않는다)
  s = s.replace(/(\d)(?=pi|sqrt\(|\()/g, "$1*");
  s = s.replace(/(\d)(?=e(?![a-z0-9]))/g, "$1*");
  s = s.replace(/\)(?=\d|pi|sqrt\(|\(|e(?![a-z0-9]))/g, ")*");
  s = s.replace(/pi(?=\d|\(|sqrt\()/g, "pi*");
  // e 뒤 삽입은 숫자 뒤 e(지수 표기 1e9)를 제외한다
  s = s.replace(/(?<![a-z0-9])e(?=\d|\(|sqrt\()/g, "e*");
  return s;
}

/**
 * L2 미니 수치 평가기 (설계 §7.6).
 *
 * normalizeMathText 출력에 대한 재귀 하강 파서: expr → term → unary → power → atom.
 * `-2^2 = -(2²)` 우선순위를 명시한다(단항 마이너스가 거듭제곱보다 약하다 — AI-P2-1).
 * 화이트리스트(숫자·pi·e·sqrt·사칙·^·괄호) 밖 토큰이 있으면 즉시 null 로 포기한다.
 * NaN/무한대(0 나눗셈, 음수 제곱근 등)도 null.
 */
export function evalClosedForm(text) {
  const source = normalizeMathText(text);
  if (!source) return null;

  // 토큰화
  const tokens = [];
  let i = 0;
  while (i < source.length) {
    const ch = source[i];
    if (ch >= "0" && ch <= "9") {
      const match = /^\d+(?:\.\d+)?/.exec(source.slice(i));
      tokens.push({ type: "number", value: Number(match[0]) });
      i += match[0].length;
    } else if (source.startsWith("sqrt", i)) {
      tokens.push({ type: "sqrt" });
      i += 4;
    } else if (source.startsWith("pi", i)) {
      tokens.push({ type: "number", value: Math.PI });
      i += 2;
    } else if (ch === "e") {
      tokens.push({ type: "number", value: Math.E });
      i += 1;
    } else if ("+-*/^()".includes(ch)) {
      tokens.push({ type: ch });
      i += 1;
    } else {
      return null; // 화이트리스트 밖 — 포기
    }
  }

  let position = 0;
  const peek = () => tokens[position]?.type;
  const fail = () => {
    throw new Error("parse");
  };

  function parseExpr() {
    let value = parseTerm();
    while (peek() === "+" || peek() === "-") {
      const op = tokens[position].type;
      position += 1;
      const rhs = parseTerm();
      value = op === "+" ? value + rhs : value - rhs;
    }
    return value;
  }
  function parseTerm() {
    let value = parseUnary();
    while (peek() === "*" || peek() === "/") {
      const op = tokens[position].type;
      position += 1;
      const rhs = parseUnary();
      value = op === "*" ? value * rhs : value / rhs;
    }
    return value;
  }
  function parseUnary() {
    if (peek() === "-") {
      position += 1;
      return -parseUnary(); // -2^2 → -(2^2) = -4
    }
    if (peek() === "+") {
      position += 1;
      return parseUnary();
    }
    return parsePower();
  }
  function parsePower() {
    const base = parseAtom();
    if (peek() === "^") {
      position += 1;
      const exponent = parseUnary(); // 우측 결합, 음수 지수 허용
      return base ** exponent;
    }
    return base;
  }
  function parseAtom() {
    const token = tokens[position];
    if (!token) fail();
    if (token.type === "number") {
      position += 1;
      return token.value;
    }
    if (token.type === "sqrt") {
      position += 1;
      if (peek() !== "(") fail();
      position += 1;
      const inner = parseExpr();
      if (peek() !== ")") fail();
      position += 1;
      return Math.sqrt(inner);
    }
    if (token.type === "(") {
      position += 1;
      const inner = parseExpr();
      if (peek() !== ")") fail();
      position += 1;
      return inner;
    }
    fail();
  }

  try {
    const value = parseExpr();
    if (position !== tokens.length) return null;
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

