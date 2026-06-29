import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const ids = [];
for (let n=1;n<=20;n++) ids.push(`q-2023-skku-${String(n).padStart(2,"0")}`);
for (let n=1;n<=20;n++) ids.push(`q-2024-skku-${String(n).padStart(2,"0")}`);
ids.push("q-2022-skku-02");

const { data, error } = await sb.from("questions").select("id,question,options,correct_option_id,explanation,subject,unit,concept,difficulty").in("id", ids);
if (error) { console.error(error); process.exit(1); }
const sorted = data.sort((a,b)=>a.id.localeCompare(b.id));
let out = "";
for (const q of sorted) {
  out += `\n===== ${q.id} | ${q.subject}/${q.unit}/${q.concept} | ${q.difficulty} | 정답=${q.correct_option_id} =====\n`;
  out += `[Q] ${q.question}\n`;
  for (const o of q.options) out += `  (${o.id}) ${o.text}\n`;
  out += `[E] ${q.explanation}\n`;
}
writeFileSync(resolve(here, "_today_skku_dump.txt"), out);
console.log(`Wrote ${sorted.length} questions, ${out.length} chars to scripts/_today_skku_dump.txt`);
