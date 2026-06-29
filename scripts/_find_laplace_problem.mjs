import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
const here = dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  readFileSync(resolve(here, "..", ".env.local"), "utf8").split(/\r?\n/).filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const [k, ...r] = l.split("="); return [k.trim(), r.join("=").trim()]; })
);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
// 라플라스 변환 관련 문제로 subject가 미분학인 것 검색
const { data, error } = await supabase.from("questions")
  .select("id, subject, unit, concept, difficulty")
  .eq("subject", "미분학")
  .or("concept.ilike.%라플라스%,unit.ilike.%라플라스%,unit.ilike.%미분방정식%")
  .limit(30);
if (error) { console.error(error); process.exit(1); }
console.log(`찾은 문제 수: ${data.length}`);
for (const q of data) {
  console.log(`  ${q.id}  subject=${q.subject}  unit=${q.unit}  concept=${q.concept}`);
}
