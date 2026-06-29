// 같은 값을 갖는 선지 쌍을 찾는 dry-run 감사 스크립트
// LaTeX 옵션 텍스트 → mathjs 수식 → 수치 평가 → 동일한 값 그룹화
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import * as mathjs from "mathjs";

const math = mathjs.create(mathjs.all);
const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(
  envText.split(/\r?\n/).filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const [k, ...r] = l.split("="); return [k.trim(), r.join("=").trim()]; })
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// LaTeX 문자열을 mathjs가 평가 가능한 식으로 변환 시도
function latexToExpr(latex) {
  if (!latex) return null;
  let s = latex;
  // 달러 기호 제거
  s = s.replace(/\$/g, "");
  // 흔한 LaTeX 명령 정규화
  s = s.replace(/\\!|\\,|\\;|\\:|\\\s|\\quad|\\qquad|~/g, "");
  s = s.replace(/\\left|\\right/g, "");
  s = s.replace(/\\displaystyle/g, "");
  s = s.replace(/\\dfrac|\\tfrac|\\frac/g, "\\frac");
  // \frac{a}{b} → (a)/(b)
  for (let i = 0; i < 10; i++) {
    const next = s.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, "(($1)/($2))");
    if (next === s) break;
    s = next;
  }
  // \sqrt[n]{x} → (x)^(1/n)
  for (let i = 0; i < 5; i++) {
    const next = s.replace(/\\sqrt\[([^\]]+)\]\{([^{}]+)\}/g, "(($2)^(1/($1)))");
    if (next === s) break;
    s = next;
  }
  // \sqrt{x} → sqrt(x)
  for (let i = 0; i < 5; i++) {
    const next = s.replace(/\\sqrt\{([^{}]+)\}/g, "sqrt(($1))");
    if (next === s) break;
    s = next;
  }
  // 상수
  s = s.replace(/\\pi/g, "pi");
  s = s.replace(/\\infty/g, "Infinity");
  // 함수 → mathjs 함수
  s = s.replace(/\\ln/g, "log");
  s = s.replace(/\\log/g, "log10");
  s = s.replace(/\\sin/g, "sin");
  s = s.replace(/\\cos/g, "cos");
  s = s.replace(/\\tan/g, "tan");
  s = s.replace(/\\sec/g, "sec");
  s = s.replace(/\\csc/g, "csc");
  s = s.replace(/\\cot/g, "cot");
  s = s.replace(/\\arcsin/g, "asin");
  s = s.replace(/\\arccos/g, "acos");
  s = s.replace(/\\arctan/g, "atan");
  s = s.replace(/\\sinh/g, "sinh");
  s = s.replace(/\\cosh/g, "cosh");
  s = s.replace(/\\tanh/g, "tanh");
  s = s.replace(/\\exp/g, "exp");
  // log_b(x) → log(x,b)
  s = s.replace(/log_\{([^{}]+)\}\(([^()]+)\)/g, "log($2,$1)");
  s = s.replace(/log_(\d+)\(([^()]+)\)/g, "log($2,$1)");
  // ^로 표시된 곱셈
  s = s.replace(/\\cdot/g, "*");
  s = s.replace(/\\times/g, "*");
  // 중괄호 → 괄호 (마지막에)
  s = s.replace(/\{/g, "(").replace(/\}/g, ")");
  // 부호와 공백
  s = s.replace(/\s+/g, "");
  // 알파벳 + 숫자 사이 묵시적 곱셈 처리
  // (예: 2e → 2*e, 3pi → 3*pi)
  s = s.replace(/(\d)(?=[a-zA-Z(])/g, "$1*");
  // 알파벳 다음 괄호도 함수 호출이 아니면 곱셈인데 단순화 위해 그대로
  return s;
}

function safeEval(expr) {
  try {
    const v = math.evaluate(expr);
    if (typeof v === "number" && isFinite(v)) return v;
    if (v && typeof v.re === "number" && typeof v.im === "number") {
      if (Math.abs(v.im) < 1e-10) return v.re;
      return null;
    }
    return null;
  } catch {
    return null;
  }
}

const EPS = 1e-6;
function areEqual(a, b) {
  if (a === null || b === null) return false;
  const scale = Math.max(1, Math.abs(a), Math.abs(b));
  return Math.abs(a - b) / scale < EPS;
}

// 전체 문제 페이지네이션 로드
const all = [];
let from = 0;
const PAGE = 1000;
while (true) {
  const { data, error } = await sb.from("questions")
    .select("id, question, options, correct_option_id, tags")
    .order("id", { ascending: true })
    .range(from, from + PAGE - 1);
  if (error) { console.error(error); process.exit(1); }
  if (!data?.length) break;
  all.push(...data);
  if (data.length < PAGE) break;
  from += PAGE;
}
const seen = new Set();
const uniq = all.filter((q) => seen.has(q.id) ? false : (seen.add(q.id), true));
console.log(`로드: ${uniq.length}문항`);

const issues = [];
let evaluable = 0;
let totalOptions = 0;
for (const q of uniq) {
  const opts = q.options || [];
  totalOptions += opts.length;
  // 각 옵션을 (id, text, expr, value) 형태로
  const evals = opts.map((o) => {
    const expr = latexToExpr(o.text || "");
    const v = expr ? safeEval(expr) : null;
    if (v !== null) evaluable++;
    return { id: o.id, text: o.text, expr, value: v };
  });
  // 같은 값 그룹 찾기
  const valuables = evals.filter((e) => e.value !== null);
  for (let i = 0; i < valuables.length; i++) {
    for (let j = i + 1; j < valuables.length; j++) {
      if (areEqual(valuables[i].value, valuables[j].value)) {
        issues.push({
          questionId: q.id,
          tags: q.tags,
          correct: q.correct_option_id,
          aId: valuables[i].id,
          aText: valuables[i].text,
          aVal: valuables[i].value,
          bId: valuables[j].id,
          bText: valuables[j].text,
          bVal: valuables[j].value,
        });
        break;
      }
    }
  }
}

console.log(`전체 옵션: ${totalOptions}, 평가 성공: ${evaluable} (${(evaluable / totalOptions * 100).toFixed(1)}%)`);
console.log(`동치 선지 쌍 발견: ${issues.length}건\n`);

// 상위 30개 미리보기
for (const i of issues.slice(0, 30)) {
  const tag = (i.tags || []).slice(0, 3).join(",");
  const correctMark = (id) => id === i.correct ? "★" : " ";
  console.log(`[${i.questionId}] (정답=${i.correct}) ${tag}`);
  console.log(`  ${correctMark(i.aId)}(${i.aId}) ${i.aText}  → ${i.aVal.toFixed(6)}`);
  console.log(`  ${correctMark(i.bId)}(${i.bId}) ${i.bText}  → ${i.bVal.toFixed(6)}`);
}
if (issues.length > 30) console.log(`\n... 외 ${issues.length - 30}건`);

writeFileSync(resolve(here, "_equivalent_options_report.json"), JSON.stringify({ total: uniq.length, evaluable, totalOptions, issues }, null, 2), "utf8");
console.log(`\n상세는 scripts/_equivalent_options_report.json 참고`);
