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

const SCHOOLS = [
  "가천대","가톨릭대","건국대","경기대","경희대","고려대","과기대","광운대",
  "국민대","단국대","동국대","명지대","서강대","성균관대","세종대","숙명여대",
  "숭실대","시립대","아주대","연세대","이화여대","인하대","중앙대","한국공학대",
  "한성대","한양대","항공대","홍익대","서울과기대","서울시립대",
];

console.log("학교별 업로드 현황 (문항수 · 연도)");
console.log("─".repeat(60));

const results = [];
for (const s of SCHOOLS) {
  const { count } = await sb
    .from("questions").select("id", { count: "exact", head: true })
    .contains("tags", [s]);
  if (!count) continue;
  const { data: rows } = await sb
    .from("questions").select("tags").contains("tags", [s]).limit(2000);
  const years = new Set();
  for (const r of rows ?? []) for (const t of r.tags ?? []) if (/^20\d{2}$/.test(t)) years.add(t);
  results.push({ s, count, years: [...years].sort() });
}

results.sort((a, b) => b.count - a.count);
for (const { s, count, years } of results) {
  const yrange = years.length ? `${years[0]}~${years[years.length - 1]} (${years.length}년)` : "(연도태그 없음)";
  console.log(`${s.padEnd(10)} ${String(count).padStart(4)}문항 · ${yrange}`);
}

const uploaded = new Set(results.map(r => r.s));
const notUploaded = SCHOOLS.filter(s => !uploaded.has(s));
console.log("\n미업로드 / 0문항:");
console.log(notUploaded.join(", "));
