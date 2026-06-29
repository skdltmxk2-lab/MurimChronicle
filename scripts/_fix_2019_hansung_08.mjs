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
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const { error } = await supabase.from("questions").update({
  explanation: "고유값의 합 $=$ 대각합(trace). 특성다항식 $\\lambda^2-(\\text{tr}A)\\lambda+\\det A=0$의 두 근의 합은 비에타 정리에 의해 $\\text{tr}A$이다.\n$\\text{tr}(A)=1+2=3$.",
  updated_at: new Date().toISOString(),
}).eq("id", "q-2019-hansung-08");
if (error) { console.error(error); process.exit(1); }
console.log("Updated q-2019-hansung-08");
