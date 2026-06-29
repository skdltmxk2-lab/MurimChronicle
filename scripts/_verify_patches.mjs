import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const ids = ["q-2022-skku-02","q-2024-skku-06","q-2024-skku-16","q-2024-skku-18","q-2023-skku-13"];
const { data, error } = await sb.from("questions").select("id,explanation").in("id", ids);
if (error) { console.error(error); process.exit(1); }
for (const q of data.sort((a,b)=>a.id.localeCompare(b.id))) {
  console.log(`\n--- ${q.id} (len=${q.explanation.length}) ---`);
  console.log(q.explanation);
  // detect TAB / lone backslashes-imes
  if (/\times/.test(q.explanation)) console.log(">>> WARNING: literal TAB+imes detected");
  if (/[^\]imes/.test(q.explanation) && !q.explanation.includes("\times")) console.log(">>> WARNING: 'imes' without preceding backslash-t detected");
}
