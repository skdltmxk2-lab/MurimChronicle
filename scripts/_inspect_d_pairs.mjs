// D 학교 자기 중복 7쌍 자세히 조회
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

const pairs = [
  ["q-2020-soongsil-23", "q-2024-dgu-20"],
  ["q-2021-sookmyung-11", "q-2025-sookmyung-10"],
  ["q-2022-sejong-06", "q-2023-sejong-04"],
  ["q-2019-dankook-32", "q-2025-cau-20"],
  ["q-2019-dankook-45", "q-2025-dku-am-07"],
  ["q-2021-gachon-14", "q-2025-gachon-02"],
  ["q-2021-inha-24", "q-2022-inha-24"],
  ["q-2023-inha-12", "q-2025-dku-am-15"],
];

for (let i = 0; i < pairs.length; i++) {
  const [a, b] = pairs[i];
  const { data } = await sb.from("questions").select("id, question, options, correct_option_id, explanation, tags, created_at").in("id", [a, b]);
  if (!data || data.length < 2) { console.log(`---\n쌍 ${i + 1}: 조회 실패`); continue; }
  console.log(`\n========== 쌍 ${i + 1}: ${a} ↔ ${b} ==========`);
  for (const q of data) {
    const ans = (q.options || []).find((o) => String(o.id) === String(q.correct_option_id));
    console.log(`\n[${q.id}] (생성: ${q.created_at})`);
    console.log(`  태그: ${(q.tags || []).join(", ")}`);
    console.log(`  Q: ${q.question}`);
    console.log(`  옵션:`);
    for (const o of q.options || []) {
      const mark = String(o.id) === String(q.correct_option_id) ? "★" : " ";
      console.log(`    ${mark}(${o.id}) ${o.text}`);
    }
    console.log(`  해설: ${(q.explanation || "").slice(0, 200)}`);
  }
}
