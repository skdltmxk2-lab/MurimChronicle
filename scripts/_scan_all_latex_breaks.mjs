// 전 문항을 훑어 수식 밖에 노출된 \\ (LaTeX line break)를 찾는다.
// KaTeXRenderer는 $...$ 안에서만 \\를 line break로 처리하므로, 밖에 있는 \\는
// 화면에 그대로 보인다 (Windows 폰트로는 ₩₩).
// 사용법: node scripts/_scan_all_latex_breaks.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

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

function findOutsideMathBreaks(text, label) {
  if (!text) return [];
  const findings = [];
  let inMath = false;
  let buf = "";
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === "$" && (i === 0 || text[i-1] !== "\\")) {
      if (!inMath && buf.includes("\\\\")) findings.push({ label, segment: buf });
      buf = "";
      inMath = !inMath;
      continue;
    }
    buf += c;
  }
  if (!inMath && buf.includes("\\\\")) findings.push({ label, segment: buf });
  return findings;
}

let issues = 0;
const bySchool = new Map();
for (const q of all) {
  const findings = [];
  findings.push(...findOutsideMathBreaks(q.question, "Q"));
  for (const o of q.options || []) findings.push(...findOutsideMathBreaks(o.text, `O[${o.id}]`));
  findings.push(...findOutsideMathBreaks(q.explanation, "E"));
  if (findings.length > 0) {
    issues++;
    // q.id 패턴: q-{year}-{school}-{...} 또는 q-daily-{...}
    const m = q.id.match(/^q-\d+-([a-z-]+?)-/);
    const school = m ? m[1] : (q.id.startsWith("q-daily") ? "daily" : "기타");
    if (!bySchool.has(school)) bySchool.set(school, []);
    bySchool.get(school).push({ id: q.id, findings });
  }
}

for (const [school, list] of [...bySchool.entries()].sort((a,b)=>b[1].length-a[1].length)) {
  console.log(`\n## ${school}: ${list.length}건`);
  for (const { id, findings } of list) {
    console.log(`  ${id}`);
    for (const f of findings) {
      console.log(`    [${f.label}] ...${f.segment.slice(0, 80).replace(/\n/g, "\\n")}...`);
    }
  }
}
console.log(`\nTotal questions with outside-math \\\\: ${issues} / ${all.length}`);
