// 건국대 모든 문항을 훑어 수식 밖에 노출된 \\ (LaTeX line break)를 찾는다.
// KaTeXRenderer는 $...$ 안에서만 \\를 line break로 처리하므로, 밖에 있는 \\는
// 화면에 그대로 보인다 (Windows 폰트로는 ₩₩).
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const { data, error } = await sb.from("questions").select("id, question, options, explanation").like("id", "q-%-konkuk-%").order("id");
if (error) { console.error(error); process.exit(1); }

// 텍스트를 $...$ 분기로 토큰화: math/text 교대.
// "\\" (두 글자 시퀀스)가 text 토큰 안에 있으면 보고.
function findOutsideMathBreaks(text, label) {
  if (!text) return [];
  const findings = [];
  let inMath = false;
  let buf = "";
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === "$" && (i === 0 || text[i-1] !== "\\")) {
      // 토큰 종료
      if (!inMath && buf.includes("\\\\")) {
        findings.push({ label, segment: buf });
      }
      buf = "";
      inMath = !inMath;
      continue;
    }
    buf += c;
  }
  if (!inMath && buf.includes("\\\\")) {
    findings.push({ label, segment: buf });
  }
  return findings;
}

let issues = 0;
for (const q of data) {
  const all = [];
  all.push(...findOutsideMathBreaks(q.question, "Q"));
  for (const o of q.options || []) all.push(...findOutsideMathBreaks(o.text, `O[${o.id}]`));
  all.push(...findOutsideMathBreaks(q.explanation, "E"));
  if (all.length > 0) {
    issues++;
    console.log(`\n=== ${q.id}`);
    for (const f of all) {
      console.log(`  [${f.label}] ...${f.segment.slice(0, 80).replace(/\n/g, "\\n")}...`);
    }
  }
}
console.log(`\nTotal questions with outside-math \\\\: ${issues}`);
