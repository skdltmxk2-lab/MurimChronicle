import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const { data } = await sb.from("questions").select("id, question, options, explanation").like("id", "q-%-kyonggi-%").order("id");
function findOutsideMathBreaks(text) {
  if (!text) return false;
  let inMath = false; let buf = "";
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === "$" && (i === 0 || text[i-1] !== "\\")) {
      if (!inMath && buf.includes("\\\\")) return true;
      buf = ""; inMath = !inMath; continue;
    }
    buf += c;
  }
  if (!inMath && buf.includes("\\\\")) return true;
  return false;
}
let issues = 0;
for (const q of data) {
  const flag = findOutsideMathBreaks(q.question) || (q.options||[]).some(o=>findOutsideMathBreaks(o.text)) || findOutsideMathBreaks(q.explanation);
  if (flag) { console.log(q.id); issues++; }
}
console.log(`Total: ${issues}`);
