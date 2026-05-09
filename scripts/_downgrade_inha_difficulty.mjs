// 인하대 모든 문항 난이도 한 단계 낮추기.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const DOWN = {
  killer: "hard",
  hard: "mediumHard",
  mediumHard: "medium",
  medium: "easyMedium",
  easyMedium: "easy",
  easy: "easy",
};

const { data, error } = await sb.from("questions").select("id, difficulty").like("id", "q-%-inha-%");
if (error) { console.error(error); process.exit(1); }
let ok = 0;
for (const q of data) {
  const next = DOWN[q.difficulty];
  if (!next || next === q.difficulty) continue;
  const { error: upErr } = await sb.from("questions").update({ difficulty: next, updated_at: new Date().toISOString() }).eq("id", q.id);
  if (upErr) console.error(`❌ ${q.id}:`, upErr.message);
  else { console.log(`✓ ${q.id}: ${q.difficulty} → ${next}`); ok++; }
}
console.log(`\n총 ${ok}건 난이도 하향 (대상 ${data.length}건)`);
