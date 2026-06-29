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
  explanation: "각 행의 차이를 보면 $R_2-R_1=(3,3,3,3),\\,R_3-R_2=(3,3,3,3),\\,R_4-R_3=(3,3,3,3)$로 모두 동일하다.\n즉 행 사이에 일정한 등차관계가 있어 행 축약 시 두 행만 독립으로 남는다. 따라서 $\\text{rank}=2$.",
  updated_at: new Date().toISOString(),
}).eq("id", "q-2022-kyunghee-24");
if (error) { console.error(error); process.exit(1); }
console.log("Updated q-2022-kyunghee-24");
