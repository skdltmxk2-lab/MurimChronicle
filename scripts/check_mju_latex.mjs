// Validate LaTeX in mju 2025 questions
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

const { data, error } = await sb.from("questions").select("id, question, options, explanation")
  .like("id", "q-2025-mju-%").order("id");
if (error) { console.error(error); process.exit(1); }

const issues = [];
for (const q of data) {
  const allText = q.question + " " + (q.options||[]).map(o=>o.text).join(" ") + " " + (q.explanation||"");
  const opens = (allText.match(/\{/g)||[]).length;
  const closes = (allText.match(/\}/g)||[]).length;
  if (opens !== closes) issues.push(`${q.id}: brace mismatch open=${opens} close=${closes}`);
  // Count $ (excluding escaped)
  let dollar = 0;
  for (let i = 0; i < allText.length; i++) {
    if (allText[i] === '$' && allText[i-1] !== '\\') dollar++;
  }
  if (dollar % 2 !== 0) issues.push(`${q.id}: odd $ count: ${dollar}`);
}

console.log(`Total uploaded: ${data.length}`);
console.log(`LaTeX issues: ${issues.length}`);
for (const i of issues) console.log(" ", i);

// Print first 2 questions for sanity
console.log("\n=== Sample (first 2) ===");
for (const q of data.slice(0,2)) {
  console.log(`\n[${q.id}]`);
  console.log("Q:", q.question.slice(0,200));
  console.log("Opts:", JSON.stringify((q.options||[]).map(o=>o.text)).slice(0,300));
}
