// 그림이 필요해 보이는데 question_image가 비어있는 문제 검토
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

// 모든 일반 문제 (daily 태그 없는 것) fetch
const { data: regular, error } = await sb
  .from("questions")
  .select("id, subject, unit, question, question_image, explanation_image, options, tags")
  .not("tags", "cs", '{"daily"}');

if (error) { console.error(error); process.exit(1); }
console.log("일반 문제 총:", regular?.length ?? 0);

// 그림 필요 키워드
const RX = /그림|그래프|도형|아래.{0,4}같|위.{0,4}같|다음.{0,4}나타/;
const suspect = (regular ?? []).filter(q => {
  const text = q.question || "";
  const hasKeyword = RX.test(text);
  const noImage = !q.question_image || q.question_image.trim() === "";
  return hasKeyword && noImage;
});

console.log("\n=== 그림 키워드 있는데 question_image 비어있음:", suspect.length, "개 ===");
suspect.forEach(q => {
  const preview = q.question.replace(/\$[^$]+\$/g, "[수식]").slice(0, 100);
  console.log(`\n[${q.id}] ${q.subject}/${q.unit}`);
  console.log(`  ${preview}`);
});

// 실제로 이미지가 살아있는 문제도 함께 보고
const alive = (regular ?? []).filter(q => q.question_image && q.question_image.trim() !== "");
console.log("\n\n=== question_image 살아있는 문제:", alive.length, "개 ===");
alive.forEach(q => console.log(`  ${q.id} | ${q.subject}/${q.unit} | ${q.question_image.slice(0,60)}`));
