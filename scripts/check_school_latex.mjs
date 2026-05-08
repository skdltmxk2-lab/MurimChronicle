// Validate LaTeX in any school's questions. Usage: node scripts/check_school_latex.mjs <id-prefix>
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(
  envText.split(/\r?\n/).filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const [k, ...r] = l.split("="); return [k.trim(), r.join("=").trim()]; })
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const prefix = process.argv[2] || "q-2025-";
const { data, error } = await sb.from("questions").select("id, question, options, explanation")
  .like("id", `${prefix}%`).order("id");
if (error) { console.error(error); process.exit(1); }

let issues = 0;
for (const q of data) {
  const t = q.question + " " + (q.options||[]).map(o=>o.text).join(" ") + " " + (q.explanation||"");
  const opens = (t.match(/\{/g)||[]).length;
  const closes = (t.match(/\}/g)||[]).length;
  if (opens !== closes) { console.log(`${q.id}: brace mismatch (${opens}/${closes})`); issues++; }
  let d = 0;
  for (let i = 0; i < t.length; i++) {
    if (t[i] === "$" && t[i-1] !== "\\") d++;
  }
  if (d % 2 !== 0) { console.log(`${q.id}: odd $ count (${d})`); issues++; }
}
console.log(`Checked: ${data.length}  Issues: ${issues}`);
