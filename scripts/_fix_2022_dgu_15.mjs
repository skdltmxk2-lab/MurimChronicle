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
  explanation: "$R_2-2R_1,R_3$ 그대로, $R_4$ 그대로 정리 후 추가 축약하면 영행이 1개 생기고 독립 피벗 행이 3개 남는다.\n$4\\times 5$ 행렬에서 rank $=3$, 영공간 차원 $=2$.",
  updated_at: new Date().toISOString(),
}).eq("id", "q-2022-dgu-15");
if (error) { console.error(error); process.exit(1); }
console.log("Updated q-2022-dgu-15");
