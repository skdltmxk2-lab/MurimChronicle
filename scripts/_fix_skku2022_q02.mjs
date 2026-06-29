import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const newExplanation = "행간소(row reduction)로 일차독립인 행 개수를 세면 된다. $4\times 6$ 행렬이므로 rank는 최대 $4$.\n실제 행간소를 진행하면 4개의 행 중 일차종속이 1개 발생하여 독립 행은 $3$개. 따라서 rank $=3$.";

const { error } = await sb.from("questions").update({
  explanation: newExplanation,
  updated_at: new Date().toISOString(),
}).eq("id", "q-2022-skku-02");

if (error) { console.error("FAIL:", error.message); process.exit(1); }
console.log("OK: q-2022-skku-02 explanation updated, length =", newExplanation.length);
