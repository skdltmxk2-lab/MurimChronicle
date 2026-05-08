// 건국대 모든 문항에서 수식 밖에 노출된 \\ (LaTeX line break)를 공백으로 교체.
// KaTeXRenderer는 수식 밖에서는 \\를 처리 안 해 화면에 그대로 보이는 문제 해결.
// 수식 안($...$ 또는 $$...$$)의 \\는 그대로 둔다 (cases/matrix line break에 필요).
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// $...$ / $$...$$ 토큰을 보존하고 사이의 텍스트에서 \\를 공백으로 교체.
function fixOutsideMath(text) {
  if (!text) return text;
  const pattern = /(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$)/g;
  let result = "";
  let last = 0;
  let m;
  while ((m = pattern.exec(text)) !== null) {
    // 수식 앞 텍스트
    const before = text.slice(last, m.index).replace(/\\\\/g, " ");
    result += before;
    // 수식 그대로
    result += m[0];
    last = pattern.lastIndex;
  }
  // 마지막 꼬리 텍스트
  result += text.slice(last).replace(/\\\\/g, " ");
  // 연속 공백 정리
  return result.replace(/  +/g, " ").trim();
}

const { data, error } = await sb.from("questions").select("id, question, options, explanation").like("id", "q-%-konkuk-%").order("id");
if (error) { console.error(error); process.exit(1); }

let fixed = 0;
for (const q of data) {
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
console.log(`\nTotal fixed: ${fixed}`);
