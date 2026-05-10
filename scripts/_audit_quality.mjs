// 전 문항 품질 일괄 점검: 수식 깨짐, 답지 부실, 보기 오류, LaTeX 오타 등.
// 사용법: node scripts/_audit_quality.mjs [school]
//   school 인자가 주어지면 q-{year}-{school}-* 만 검사 (예: konkuk).
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const filterSchool = process.argv[2] || null;

// 페이지네이션
const PAGE = 1000;
const all = [];
for (let from = 0; ; from += PAGE) {
  let q = sb.from("questions").select("id, subject, unit, question, options, correct_option_id, explanation, content_type, question_image, explanation_content_type, explanation_image, question_type, answer_text").order("id").range(from, from + PAGE - 1);
  if (filterSchool) q = q.like("id", `q-%-${filterSchool}-%`);
  const { data, error } = await q;
  if (error) { console.error(error); process.exit(1); }
  if (!data || data.length === 0) break;
  all.push(...data);
  if (data.length < PAGE) break;
}

// 토큰화: $...$ / $$...$$ 추출, 짝 안 맞으면 표시
function countDollars(text) {
  if (!text) return 0;
  let count = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "$" && (i === 0 || text[i-1] !== "\\")) count++;
  }
  return count;
}

// 수식 밖 텍스트만 추출
function outsideMath(text) {
  if (!text) return "";
  const pattern = /(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$)/g;
  return text.replace(pattern, " ");
}

// 수식 안만 추출
function insideMath(text) {
  if (!text) return [];
  const pattern = /(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$)/g;
  return Array.from(text.matchAll(pattern)).map(m => m[0]);
}

const issues = {
  A_dollar_mismatch: [],
  B_thin_explanation: [],
  C_options_problem: [],
  D_latex_typo: [],
  E_outside_math_command: [],
  F_image_missing: [],
};

const COMMON_LATEX_CMDS = ["\\frac","\\sqrt","\\pi","\\theta","\\alpha","\\beta","\\gamma","\\delta","\\sum","\\int","\\lim","\\infty","\\le","\\ge","\\neq","\\times","\\div","\\cdot","\\to","\\dfrac","\\mathrm","\\sin","\\cos","\\tan","\\log","\\ln"];

for (const q of all) {
  const allFields = [
    { name: "Q", text: q.question || "" },
    ...((q.options || []).map(o => ({ name: `O[${o.id}]`, text: o.text || "" }))),
    { name: "E", text: q.explanation || "" },
  ];

  // A. $ 홀수
  for (const f of allFields) {
    if (countDollars(f.text) % 2 !== 0) {
      issues.A_dollar_mismatch.push({ id: q.id, field: f.name, snippet: f.text.slice(0, 100) });
      break;
    }
  }

  // B. 해설 부실
  const expLen = (q.explanation || "").trim().length;
  if (expLen < 30) {
    issues.B_thin_explanation.push({ id: q.id, length: expLen, snippet: (q.explanation || "").slice(0, 80) });
  }

  // C. 보기 문제 — 단답형은 옵션 없음 정상; 객관식은 4지/5지
  const opts = q.options || [];
  const isSubjective = q.question_type === "subjective";
  if (isSubjective) {
    if (!q.answer_text || q.answer_text.trim().length === 0) {
      issues.C_options_problem.push({ id: q.id, reason: `단답형 정답 미지정`, opts: [] });
    }
  } else if (opts.length !== 4 && opts.length !== 5) {
    issues.C_options_problem.push({ id: q.id, reason: `옵션 ${opts.length}개`, opts: opts.map(o=>o.id) });
  } else {
    const emptyOpts = opts.filter(o => !o.text || o.text.trim().length === 0);
    if (emptyOpts.length > 0) {
      issues.C_options_problem.push({ id: q.id, reason: `빈 보기 ${emptyOpts.length}개`, opts: emptyOpts.map(o=>o.id) });
    } else if (q.correct_option_id && !opts.find(o => o.id === q.correct_option_id)) {
      issues.C_options_problem.push({ id: q.id, reason: `정답 ${q.correct_option_id}가 옵션에 없음`, opts: opts.map(o=>o.id) });
    } else if (!q.correct_option_id) {
      issues.C_options_problem.push({ id: q.id, reason: `정답 미지정`, opts: opts.map(o=>o.id) });
    }
  }

  // D. LaTeX 오타 / 빈 명령
  for (const f of allFields) {
    const inside = insideMath(f.text);
    for (const m of inside) {
      const issuesFound = [];
      // \fra가 \frac가 아닌 경우
      if (/\\fra(?![c])/.test(m)) issuesFound.push("\\fra 오타?");
      // 빈 \frac{} 또는 닫히지 않음
      if (/\\frac\s*\{[^{}]*$/.test(m)) issuesFound.push("\\frac 닫힘 누락");
      if (/\\frac\s*\{\s*\}/.test(m)) issuesFound.push("빈 \\frac{}");
      if (/\\sqrt\s*\{\s*\}/.test(m)) issuesFound.push("빈 \\sqrt{}");
      // 알 수 없는 그리스/연산자 (Unicode 직접 사용 — 의도적일 수도 있음)
      // $...$ 안에서 ₩ 또는 한글 변환 글자 있으면 의심
      if (/[₩]/.test(m)) issuesFound.push("₩ 글자 (인코딩 오류?)");
      if (issuesFound.length > 0) {
        issues.D_latex_typo.push({ id: q.id, field: f.name, problems: issuesFound, snippet: m.slice(0, 80) });
      }
    }
  }

  // E. math 밖에 노출된 LaTeX 명령
  for (const f of allFields) {
    const outside = outsideMath(f.text);
    for (const cmd of COMMON_LATEX_CMDS) {
      if (outside.includes(cmd)) {
        issues.E_outside_math_command.push({ id: q.id, field: f.name, cmd, snippet: outside.match(new RegExp(`.{0,30}${cmd.replace(/\\/g,"\\\\")}.{0,30}`))?.[0] || "" });
        break;
      }
    }
  }

  // F. image content type인데 이미지 없음
  if ((q.content_type === "image" || q.content_type === "mixed") && !q.question_image) {
    issues.F_image_missing.push({ id: q.id, contentType: q.content_type, where: "question" });
  }
  if ((q.explanation_content_type === "image" || q.explanation_content_type === "mixed") && !q.explanation_image) {
    issues.F_image_missing.push({ id: q.id, contentType: q.explanation_content_type, where: "explanation" });
  }
}

// 출력
console.log(`\n=== 점검 대상: ${all.length}문항${filterSchool ? ` (${filterSchool})` : " (전체)"} ===`);

const labels = {
  A_dollar_mismatch: "A. 수식 $ 짝 안 맞음 (홀수 개)",
  B_thin_explanation: "B. 해설 부실 (30자 미만)",
  C_options_problem: "C. 보기/정답 오류",
  D_latex_typo: "D. LaTeX 오타·빈 명령·인코딩 의심",
  E_outside_math_command: "E. 수식 밖에 LaTeX 명령 노출",
  F_image_missing: "F. 이미지 누락",
};

for (const [key, list] of Object.entries(issues)) {
  console.log(`\n## ${labels[key]} — ${list.length}건`);
  for (const item of list.slice(0, 50)) {
    if (key === "A_dollar_mismatch") console.log(`  ${item.id} [${item.field}] ${item.snippet}`);
    else if (key === "B_thin_explanation") console.log(`  ${item.id} (${item.length}자) "${item.snippet}"`);
    else if (key === "C_options_problem") console.log(`  ${item.id} ${item.reason} (${item.opts.join(",")})`);
    else if (key === "D_latex_typo") console.log(`  ${item.id} [${item.field}] ${item.problems.join(", ")} :: ${item.snippet}`);
    else if (key === "E_outside_math_command") console.log(`  ${item.id} [${item.field}] ${item.cmd} :: ${item.snippet}`);
    else if (key === "F_image_missing") console.log(`  ${item.id} ${item.where}: contentType=${item.contentType}, image 비어있음`);
  }
  if (list.length > 50) console.log(`  ... 그 외 ${list.length - 50}건`);
}

const total = Object.values(issues).reduce((s,l)=>s+l.length, 0);
console.log(`\n=== 총 ${total}건 의심 ===`);
