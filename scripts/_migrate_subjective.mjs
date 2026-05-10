// 단답형 마이그레이션: 기존 24개 subjective 태그 문제를 question_type='subjective'로 전환
// (DDL은 Supabase Studio SQL Editor에서 별도 적용 — 이 스크립트는 데이터 마이그레이션만)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const { data, error } = await sb.from("questions").select("id, options, question_type, answer_text, tags").contains("tags", ["subjective"]);
if (error) { console.error(error); process.exit(1); }

console.log(`subjective 태그 문제: ${data.length}건`);
let updated = 0, alreadyClean = 0;
for (const row of data) {
  // options가 이미 비어있고 correct_option_id도 비어있으면 깨끗한 상태
  const isClean = Array.isArray(row.options) && row.options.length === 0;
  if (row.question_type === "subjective" && row.answer_text && isClean) {
    alreadyClean++;
    continue;
  }
  // answer_text가 비어있으면 options[0].text에서 가져옴
  const ans = row.answer_text || row.options?.[0]?.text;
  if (!ans) { console.warn(`답 없음: ${row.id}`); continue; }
  const { error: e } = await sb.from("questions").update({
    question_type: "subjective",
    answer_text: ans,
    options: [],
    correct_option_id: ""
  }).eq("id", row.id);
  if (e) { console.error(`${row.id}:`, e.message); continue; }
  updated++;
}
console.log(`업데이트: ${updated}건, 이미 정리됨: ${alreadyClean}건`);
