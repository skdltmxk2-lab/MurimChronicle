import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

// 1) tags 에 "성균관대" 들어간 문제 수
const { count: totalCount } = await sb
  .from("questions")
  .select("id", { count: "exact", head: true })
  .contains("tags", ["성균관대"]);
console.log("성균관대 태그 문제 수:", totalCount);

// 2) 연도별 분포 — 샘플 가져와서 tags 안의 연도 카운트
const { data: rows } = await sb
  .from("questions")
  .select("id, tags")
  .contains("tags", ["성균관대"])
  .limit(2000);

const yearCount = new Map();
for (const r of rows ?? []) {
  for (const t of r.tags ?? []) {
    if (/^20\d{2}$/.test(t)) {
      yearCount.set(t, (yearCount.get(t) ?? 0) + 1);
    }
  }
}
const sorted = [...yearCount.entries()].sort();
console.log("연도별:");
for (const [y, c] of sorted) console.log(`  ${y}: ${c}`);
