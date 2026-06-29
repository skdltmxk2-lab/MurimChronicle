// 미분방정식·라플라스 등의 unit이 어느 subject로 분류돼있는지 감사
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

const PAGE = 1000;
const all = [];
for (let from = 0; ; from += PAGE) {
  const { data, error } = await supabase
    .from("questions")
    .select("subject, unit")
    .range(from, from + PAGE - 1);
  if (error) throw error;
  if (!data || data.length === 0) break;
  all.push(...data);
  if (data.length < PAGE) break;
}

// subject별 unit별 카운트
const map = new Map();
for (const q of all) {
  const key = `${q.subject}|${q.unit}`;
  map.set(key, (map.get(key) ?? 0) + 1);
}
const entries = [...map.entries()].sort((a, b) => b[1] - a[1]);
console.log(`총 ${all.length}문항`);
console.log(`subject|unit 조합 수: ${entries.length}`);
console.log(`\n=== 전체 ===`);
for (const [k, v] of entries) console.log(`  ${v.toString().padStart(4)}  ${k}`);
