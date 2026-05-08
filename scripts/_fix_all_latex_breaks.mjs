// 전 문항에서 수식 밖에 노출된 \\ (LaTeX line break)를 공백으로 교체.
// KaTeXRenderer는 수식 밖에서는 \\를 처리 안 해 화면에 그대로 보이는 문제 해결.
// 수식 안($...$ 또는 $$...$$)의 \\는 그대로 둔다 (cases/matrix line break에 필요).
// 사용법: node scripts/_fix_all_latex_breaks.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

function fixOutsideMath(text) {
  if (!text) return text;
  const pattern = /(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$)/g;
  let result = "";
  let last = 0;
  let m;
  while ((m = pattern.exec(text)) !== null) {
    const before = text.slice(last, m.index).replace(/\\\\/g, "\n");
    result += before;
    result += m[0];
    last = pattern.lastIndex;
  }
  result += text.slice(last).replace(/\\\\/g, "\n");
  // 같은 줄 안에서만 연속 공백 정리, 줄바꿈은 보존
  return result.split("\n").map(l => l.replace(/  +/g, " ").trim()).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

// 페이지네이션으로 전체 가져오기
const PAGE = 1000;
const all = [];
for (let from = 0; ; from += PAGE) {
  const { data, error } = await sb
    .from("questions")
    .select("id, question, options, explanation")
    .order("id")
    .range(from, from + PAGE - 1);
  if (error) { console.error(error); process.exit(1); }
  if (!data || data.length === 0) break;
  all.push(...data);
  if (data.length < PAGE) break;
}

let fixed = 0;
for (const q of all) {
  const newQuestion = fixOutsideMath(q.question);
  const newOptions = (q.options || []).map(o => ({ ...o, text: fixOutsideMath(o.text) }));
  const newExplanation = fixOutsideMath(q.explanation);

  const changed =
    newQuestion !== q.question ||
    JSON.stringify(newOptions) !== JSON.stringify(q.options) ||
    newExplanation !== q.explanation;

  if (!changed) continue;

  const { error: upErr } = await sb.from("questions").update({
    question: newQuestion,
    options: newOptions,
    explanation: newExplanation,
    updated_at: new Date().toISOString()
  }).eq("id", q.id);
  if (upErr) {
    console.error(`  ${q.id} FAILED:`, upErr.message);
  } else {
    console.log(`  ${q.id} fixed`);
    fixed++;
  }
}
console.log(`\nTotal fixed: ${fixed} / scanned ${all.length}`);
