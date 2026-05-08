// 그림이 있는 문제(question_image != null)인데 content_type='latex'로 저장돼
// 화면에 그림이 안 그려지는 행을 일괄로 'mixed'로 승격한다.
// Usage: node scripts/fix_image_content_type.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const [k, ...r] = l.split("=");
      return [k.trim(), r.join("=").trim()];
    })
);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const { data, error } = await supabase
  .from("questions")
  .select("id, content_type")
  .not("question_image", "is", null);

if (error) {
  console.error(error);
  process.exit(1);
}

const targets = (data ?? []).filter((r) => r.content_type !== "mixed" && r.content_type !== "image");
console.log(`question_image 있는 행: ${data?.length ?? 0}, 승격 대상: ${targets.length}`);

for (const row of targets) {
  const { error: upErr } = await supabase
    .from("questions")
    .update({ content_type: "mixed", updated_at: new Date().toISOString() })
    .eq("id", row.id);
  if (upErr) {
    console.error(`  - ${row.id}  FAILED:`, upErr.message);
  } else {
    console.log(`  - ${row.id}  ${row.content_type} → mixed`);
  }
}
console.log("done.");
